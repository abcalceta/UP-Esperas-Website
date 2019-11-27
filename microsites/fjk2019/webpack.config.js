const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
let nodeModules = {}
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

const common = {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            _: 'lodash'
        })
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
    }
};

const web = {
    devServer: {
        contentBase: path.resolve(__dirname, 'src'),
        //compress: true,
        port: '6161'
    },
    entry: './src/web/index.js',
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        //publicPath: './'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/web/templates/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jp(e?)g|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        outputPath: 'img'
                    }
                }
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: {
                    loader: 'html-loader?interpolate'
                }
            }
        ]
    }
};

const api = {
    entry: './src/api/index.js',
    output: {
        filename: 'api.js',
        path: path.resolve(__dirname, 'dist_api'),
        //publicPath: './'
    },
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/)
    ],
    externals: nodeModules,
    target: 'node'
}

module.exports = [
    Object.assign({}, common, web),
    Object.assign({}, common, api)
];