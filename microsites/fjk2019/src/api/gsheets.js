const fs = require('fs');
const path = require('path');
const g = require('googleapis');

function authorize() {
    return readFileAsync(path.resolve(__dirname, '../../config/gsheets.json'))
        .then(JSON.parse)
        .then((data) => {
            return new g.google.auth.OAuth2(
                data.client_id, data.client_secret, data.redirect_uris[0]
            );
        })
        .then((oAuthClient) => {
            return {
                'nonce_url': getAuthUrl(oAuthClient)
            };
        })
        .catch((error) => {
            console.error('Error in authorize()');
            console.error(error);
        });
}

function getAuthUrl(oAuthClient) {
    return oAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    });
}

function getAuthToken(oAuthClient, nonce) {
    return oAuthClient.getToken(nonce)
        .then((token) => {
            oAuthClient.setCredentials(token);
        })
        .catch((err) => {
            console.error(`Error retrieving access token: ${err}`);
        });
}

function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
            if(err) {
                reject(err);
                return;
            }

            resolve(data);
        });
    });
}

module.exports = {
    authorize: authorize
};