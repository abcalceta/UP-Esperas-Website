const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

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
    mode: 'production',
    target: 'node',
    entry: ['babel-polyfill', './src/discord/bot.js'],
    output: {
        filename: 'bot.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        //publicPath: './'
    },
    plugins: [
        new CopyPlugin([
            { from: './.env', to: '.' },
            { from: './src/i18n', to: 'i18n' },
            { from: './src/discord', to: 'discord' },
            { from: './src/tg', to: 'tg' }
        ]),
        new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|htm(l?))$/,
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
            compressionOptions: { level: 6 }
        }),
        /*
        new CompressionPlugin({
            filename: '[path].br[query]',
            algorithm: 'brotliCompress',
            test: /\.(js|css|htm(l?))$/,
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
            compressionOptions: { level: 11 }
        }),
        */
    ],
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
    },
    externals: nodeModules,
};

module.exports = [
    conf,
];