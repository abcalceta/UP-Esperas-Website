const express = require('express');
const gsheets = require('./gsheets');

const app = express();
const port = 6002;

app.get('/api/', function(req, res) {
    res.send('hello world!');
});

app.get('/api/authorize', function(req, res) {
    gsheets.authorize()
        .then((data) => {
            res.send(data);
        })
        .catch(console.error);
});

app.listen(port, (error) => {
    if(error) {
        console.error(`Failed to run API server on port ${port}: ${error}`);
    }
    else {
        console.info(`API server is running on port ${port}`);
    }
});