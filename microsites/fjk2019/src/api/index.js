const express = require('express');
const uuidv4 = require('uuid/v4');

const gsheets = require('./gsheets');
const gauth = require('./gauth');

const app = express();
const port = 6002;

const ALLOWED_ORIGINS = ['localhost', 'fjk.up-esperas.org'];

// Init .env
require('dotenv').config();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    console.log(req.hostname);

    if(ALLOWED_ORIGINS.includes(req.hostname)) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    }

    next();
});

// Routes
app.get('/api/auth/get', function(req, res) {
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

app.get('/api/auth/next', function(req, res) {
    return gauth.setTokenFromCode(req.query.code)
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.send(err);
        });
});

app.get('/api/regdata/append', async function(req, res) {
    let result = await gsheets.addSheetEntries([
        [new Date().toLocaleDateString('en-PH'), uuidv4(), 'Dizon', 'Carl', 'C', 'Carl', '1997-08-27', 'Male', 'PHL', 'abc@def.ghz', 'squeekeek'],
        [new Date().toLocaleDateString('en-PH'), uuidv4(), 'Garrido', 'Albert Stalin', 'T', 'Albert', '1997-11-20', 'Male', 'PHL', 'abc@def.ghz', 'astgarrido']
    ]);

    res.status(result.status).send(result);
});

app.post('/api/register', async function(req, res) {
    console.log(req.body);

    res.status(200).send({status: 200});
});

app.use(function(req, res) {
    res.status(404).send({
        status: 404,
        title: 'Not Found'
    });
});

app.listen(port, (error) => {
    if(error) {
        console.error(`Failed to run API server on port ${port}: ${error}`);
    }
    else {
        console.info(`API server is running on port ${port}`);
    }
});