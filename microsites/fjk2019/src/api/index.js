import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uuidv4 from 'uuid/v4';
import { body, validationResult, oneOf } from 'express-validator';

import {DbInterface} from './db/DbInterface';
import {PaypalPage} from './paypal';
import gsheets from './gsheets';
import gauth from './gauth';
import {Logger} from './logger';

// Init .env
require('dotenv').config();

function main() {
    const ALLOWED_ORIGINS = ['localhost', 'fjk.up-esperas.org'];

    const expressApp = express();
    const dbInterface = new DbInterface();
    const logger = Logger.createNewLogger();

    if (process.env.NODE_ENV !== 'production') {
        logger.add(Logger.consoleTransport);
    }

    process.env.SHARED_LOGGER = logger;

    // Middlewares
    expressApp.use(express.json());
    expressApp.use(express.urlencoded({ extended: true }));
    expressApp.use(helmet());
    expressApp.use(cors({
        origin: (origin, callback) => {
            if(!origin) {
                callback(null, true);
                return;
            }

            const matches = origin.match(/^https?:\/\/([^:]*):?([0-9]{4})?$/);

            if(ALLOWED_ORIGINS.includes(matches[1])) {
                callback(null, true);
                return;
            }

            callback(new Error('Origin domain not recognized'));
        }
    }));

    expressApp.options('*', function(req, res) {
        const requestHeader = req.header('Access-Control-Request-Header');

        return res
            .header('Access-Control-Allow-Methods', 'GET, POST')
            .header('Access-Control-Allow-Headers', requestHeader !== undefined ? requestHeader : '*')
            .status(200)
            .send();
    });

    // Routes
    // Auth
    expressApp.get('/api/auth/get', function(req, res) {
        gauth.authorize()
            .then(() => {
                res.send({
                    status: 200,
                    title: 'Successfully authenticated!'
                });
            })
            .catch((errObj) => {
                console.error(`Error in ${req.path}: ${errObj}`);

                if(typeof errObj.oAuthUrl === 'string') {
                    res.status(401).send({
                        status: 401,
                        title: 'Needs authorization',
                        detail: 'App needs authorization from this account to proceed. Redirect to nonce_url to authorize.',
                        nonce_url: errObj.oAuthUrl
                    });
                }
                else {
                    res.status(400).send({
                        status: 400,
                        title: 'Generic error',
                        detail: errObj.errorDesc
                    });
                }
            });
    });

    expressApp.get('/api/auth/next', function(req, res) {
        return gauth.setTokenFromCode(req.query.code)
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.send(err);
            });
    });

    // Sheets
    expressApp.get('/api/regdata/append', async function(req, res) {
        let result = await gsheets.addSheetEntries([
            [new Date().toLocaleDateString('en-PH'), uuidv4(), 'Dizon', 'Carl', 'C', 'Carl', '1997-08-27', 'Male', 'PHL', 'abc@def.ghz', 'squeekeek'],
            [new Date().toLocaleDateString('en-PH'), uuidv4(), 'Garrido', 'Albert Stalin', 'T', 'Albert', '1997-11-20', 'Male', 'PHL', 'abc@def.ghz', 'astgarrido']
        ]);

        res.status(result.status).send(result);
    });

    // Register
    expressApp.post('/api/register', [
            body('txt-last-name').not().isEmpty(),
            body('txt-first-name').not().isEmpty(),
            body('txt-nickname').not().isEmpty(),
            body('txt-email').not().isEmpty().isEmail(),
            body('hdn-reg-fee').isNumeric(),
            body('hdn-reg-currency').isLength({max: 1}),
            oneOf([
                body('txt-congress-fund').isEmpty(),
                body('txt-congress-fund').isNumeric(),
            ]),
            oneOf([
                body('txt-participant-fund').isEmpty(),
                body('txt-participant-fund').isNumeric(),
            ]),
            oneOf([
                body('txt-fej-fund').isEmpty(),
                body('txt-fej-fund').isNumeric(),
            ]),
        ],
        async function(req, res) {
            const errors = validationResult(req);
            let entryIds;

            if(!errors.isEmpty()) {
                logger.error('Cannot process sent registration form');

                res.status(422).json({
                    status: 422,
                    title: 'Unprocessable entity',
                    detail: 'Some fields sent through this resource are invalid. Please check "errors" for more details',
                    errors: errors.array(),
                });

                return;
            }

            try {
                entryIds = await dbInterface.addNewRegistrant(req.body['txt-nickname']);
            }
            catch(err) {
                logger.error('Failed to add new registrant');
                logger.error(err);

                res.status(500).send({
                    status: 500,
                    title: 'Cannot add new registrant',
                    error: 'err',
                });

                return;
            }

            try {
                await dbInterface.addNewFormAnswers(entryIds.registrantId, req.body['hdn-reg-category'], req.body);
            }
            catch(err) {
                logger.error('Failed to add new form answers');
                logger.error(err);

                res.status(500).send({
                    status: 500,
                    title: 'Failed to add new form answers',
                    error: err,
                });

                return;
            }

            try {
                await dbInterface.addNewPaymentEntry(entryIds.paymentId, req.body);
            }
            catch(err) {
                logger.error('Failed to add new payment entry');
                logger.error(err);

                res.status(500).send({
                    status: 500,
                    title: 'Cannot add new payment entry',
                    error: err,
                });

                return;
            }

            logger.info('Registration successfully recorded!');
            logger.info(`registrantId ${entryIds.registrantId}`);
            logger.info(`paymentId ${entryIds.paymentId}`);

            res.status(200).send({
                status: 200,
                registerId: entryIds.registrantId,
                paymentId: entryIds.paymentId,
            });
        }
    );

    expressApp.post('/api/payment', async function(req, res) {
        try {
            const paymentPage = await PaypalPage.createPaymentPage(req.origin, process.env.PAYPAL_CLIENT_ID, req.body, req.query.lang);

            res.status(200).type('html').send(paymentPage);
        }
        catch(err) {
            console.error(`Failed to fetch payment page: ${err}`);

            res.status(400).send({
                status: 400,
                title: 'Failed to fetch payment page',
                error: err,
            });
        }
    });

    expressApp.use(function(req, res) {
        res.status(404).send({
            status: 404,
            title: 'Not Found',
        });
    });

    expressApp.listen(process.env.API_PORT, (error) => {
        if(error) {
            console.error(`Failed to run API server on port ${process.env.API_PORT}: ${error}`);
        }
        else {
            console.info(`API server is running on port ${process.env.API_PORT}`);
        }
    });
}

main();
