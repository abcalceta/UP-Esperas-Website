const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

const {google} = require('googleapis');

/** Promisified funcs **/
const CONFIG_PATH = path.resolve(__dirname, 'config/');
const TOKENS_PATH = path.resolve(CONFIG_PATH, 'gapi_tokens.json');

function authorize() {
    const oAuthClient = new google.auth.OAuth2(
        process.env.GSHEETS_CLIENT_ID,
        process.env.GSHEETS_CLIENT_SECRET,
        process.env.GSHEETS_REDIRECT_URL,
    );

    return fs.promises.readFile(TOKENS_PATH)
        .then(JSON.parse)
        .then((tokens) => {
            oAuthClient.setCredentials(tokens);

            return {
                status: 200,
                success: true,
                oAuthClient: oAuthClient,
            }
        })
        .catch((err) => {
            return Promise.reject({
                status: 401,
                success: false,
                errorDesc: err.code,
                oAuthUrl: getAuthUrl(oAuthClient),
            });
        });
}

async function setTokenFromCode(authCode) {
    const oAuthClient = new google.auth.OAuth2(
        process.env.GSHEETS_CLIENT_ID,
        process.env.GSHEETS_CLIENT_SECRET,
        process.env.GSHEETS_REDIRECT_URL,
    );

    let authTokens;

    try {
        authTokens = await oAuthClient.getToken(authCode);
    }
    catch(err) {
        let httpStatus = 401;

        if(typeof err.code === 'string') {
            httpStatus = err.code;
        }
        
        return {
            status: httpStatus,
            title: 'Cannot get token',
            detail: err.message
        };
    }

    try {
        await fs.promises.mkdir(CONFIG_PATH, {recursive: true})
        await fs.promises.writeFile(TOKENS_PATH, JSON.stringify(authTokens.tokens));
    }
    catch(err) {
        return {
            status: 500,
            title: 'Cannot save tokens',
            detail: err.message,
        };
    }

    return {
        status: 200,
        title: 'Successfully authenticated!',
    };
}

function getAuthUrl(oAuthClient) {
    return oAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets',
        ]
    });
}

module.exports = {
    authorize: authorize,
    setTokenFromCode: setTokenFromCode,
};