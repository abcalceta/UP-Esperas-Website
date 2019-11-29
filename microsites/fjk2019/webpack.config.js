const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
let nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

const common = {
    mode: 'development',
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
    target: 'web',
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src/web'),
        compress: true,
        port: 6161
    },
    entry: './src/web/index.js',
    output: {
        filename: 'bundle-web.js',
        path: path.resolve(__dirname, 'dist/web'),
        //publicPath: './'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/web/templates/index.html'
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
                        name: '[name]_[contenthash].[ext]',
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
    target: 'node',
    entry: './src/api/index.js',
    output: {
        filename: 'api.js',
        path: path.resolve(__dirname, 'dist/api'),
        //publicPath: './'
    },
    plugins: [
        new webpack.IgnorePlugin(/\.(css|less)$/)
    ],
    externals: nodeModules
};

module.exports = [
    Object.assign({}, common, web),
    Object.assign({}, common, api)
];