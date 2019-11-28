const {promisify} = require('util');

const {google} = require('googleapis');
const gauth = require('./gauth');

/** Spreadsheet operations **/
async function addSheetEntries(rowData) {
    let oAuthClient;
    let result;

    try {
        let oAuthClientObj = await gauth.authorize();

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
        const appendSheetAsync = promisify(sheets.spreadsheets.values.append).bind(sheets.spreadsheets.values);
        result = await appendSheetAsync({
            spreadsheetId: process.env.GSHEETS_REGSHEET_ID,
            range: 'Website!A3:G3',
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
        num_rows_changed: result.data.updates.updatedRows,
        num_cells_changed: result.data.updates.updatedCells
    };
}

module.exports = {
    addSheetEntries: addSheetEntries
};