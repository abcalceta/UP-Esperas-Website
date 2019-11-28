const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const {promisify} = require('util');

/** Promisified funcs **/
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/** oAuth Login **/
function authorize(client_id, client_secret, redirect_uri) {
    const oAuthClient = new google.auth.OAuth2(
        client_id, client_secret, redirect_uri
    );

    return readFileAsync(path.resolve(__dirname, '../../config/gapi_tokens.json'))
        .then(JSON.parse)
        .then((tokens) => {
            oAuthClient.setCredentials(tokens);

            return {
                status: 200,
                success: true,
                oAuthClient: oAuthClient
            }
        })
        .catch((err) => {
            return Promise.reject({
                status: 401,
                success: false,
                errorDesc: err.code,
                oAuthUrl: getAuthUrl(oAuthClient)
            });
        });
}

function getCredentials() {
    return readFileAsync(path.resolve(__dirname, '../../config/gsheets.json'))
        .then(JSON.parse)
        .then((data) => {
            return authorize(data.client_id, data.client_secret, data.redirect_uris[0]);
        })
        .catch((err) => {
            return Promise.reject(err);
        });
}

function setTokenFromCode(authCode) {
    return readFileAsync(path.resolve(__dirname, '../../config/gsheets.json'))
        .then(JSON.parse)
        .then((data) => {
            return new google.auth.OAuth2(
                data.client_id, data.client_secret, data.redirect_uris[0]
            );
        })
        .then((oAuthClient) => {
            return Promise.all([oAuthClient, oAuthClient.getToken(authCode)]);
        })
        .then((res) => {
            let oAuthClient = res[0];
            let tokens = res[1];

            oAuthClient.setCredentials(tokens);
            return writeFileAsync(path.resolve(__dirname, '../../config/gapi_tokens.json'), JSON.stringify(tokens))
        })
        .then(() => {
            return {
                status: 200,
                title: 'Successfully authenticated!'
            }
        })
        .catch((error) => {
            console.error('Error in getTokenFromCode()');
            console.error(error);

            return {
                status: 401,
                title: 'Invalid authorization code'
            };
        });;
}

function getAuthUrl(oAuthClient) {
    return oAuthClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/spreadsheets'
        ]
    });
}

/** Spreadsheet operations **/
async function addSheetEntries(rowData) {
    let oAuthClient;
    let sheetId;
    let result;

    try {
        let oAuthClientObj = await getCredentials();

        if(!oAuthClientObj.success) {
            throw 'Authorization unsuccessful';
        }

        oAuthClient = oAuthClientObj.oAuthClient;
    }
    catch(err) {
        return err;
    }

    const sheets = google.sheets({
        version: 'v4',
        auth: oAuthClient
    });

    try {
        let gSheetObj = await readFileAsync(path.resolve(__dirname, '../../config/gsheets.json'));
        sheetId = JSON.parse(gSheetObj).sheet_id;
    }
    catch(err) {
        return {
            status: 400,
            title: 'Config file not found',
            detail: 'ENOENT'
        };
    }

    try {
        const appendSheetAsync = promisify(sheets.spreadsheets.values.append).bind(sheets.spreadsheets.values);
        result = await appendSheetAsync({
            spreadsheetId: sheetId,
            range: 'Website!A1:G1',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: rowData
            }
        });
    }
    catch(err) {
        console.log(err);

        return {
            status: 400,
            title: 'Cannot append rows to sheet',
            detail: `${err.message}`
        };
    }

    return {
        status: 200,
        title: 'Successfully appended rows!',
        num_rows_changed: result.updates.updatedRows,
        num_cells_changed: result.updates.updatedCells
    };
}

module.exports = {
    getCredentials: getCredentials,
    setTokenFromCode: setTokenFromCode,
    addSheetEntries: addSheetEntries
};