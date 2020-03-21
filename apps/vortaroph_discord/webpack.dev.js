const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
let nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

const conf = {
    mode: 'development',
    name: 'bot',
    target: 'node',
    entry: './src/bot.js',
    output: {
        filename: 'bot.js',
        path: path.resolve(__dirname, 'dist/api'),
        //publicPath: './'
    },
    watchOptions: {
        ignored: [
            'node_modules'
        ]
    },
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/)
    ],
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    }
}

module.exports = [
    conf,
];