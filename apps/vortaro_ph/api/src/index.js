import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import uuidv4 from 'uuid/v4';

function main() {
    const ALLOWED_ORIGINS = ['localhost', 'www.up-esperas.org'];

    const expressApp = express();

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

    expressApp.post('/api/search', async function(req, res) {
        
    });
}