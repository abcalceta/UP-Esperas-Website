const express = require('express');
const gsheets = require('./gsheets');

const app = express();
const port = 6002;

app.get('/api/auth/get', function(req, res) {
    gsheets.getCredentials()
        .then(() => {
            res.send({
                status: 200,
                title: 'Successfully authenticated!'
            });
        })
        .catch((errObj) => {
            console.error(`Error in ${req.path}: ${errObj.message}`);

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
    return gsheets.setTokenFromCode(req.query.code)
            .then((data) => {
                res.send(data);
            })
            .catch((err) => {
                res.send(err);
            });
});

app.get('/api/regdata/append', async function(req, res) {
    let result = await gsheets.addSheetEntries([
        ['Dizon', 'Carl', 'C', 'Carl']
    ]);

    res.status(result.status).send(result);
})

app.listen(port, (error) => {
    if(error) {
        console.error(`Failed to run API server on port ${port}: ${error}`);
    }
    else {
        console.info(`API server is running on port ${port}`);
    }
});