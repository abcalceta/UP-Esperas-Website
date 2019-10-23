const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    devtool: 'eval-source-map',
    devServer: {
        contentBase: path.resolve(__dirname, 'src'),
        //compress: true,
        port: '6161'
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: './'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/templates/index.html'
        }),
        new CopyWebpackPlugin([
            {
                from: './src/img',
                to: 'img'
            },
            {
                from: './src/styles',
                to: 'styles'
            }
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery'
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jp(e?)g|gif)$/,
                use: [
                    'file-loader'
                ]
            },
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: {
                    loader: 'html-loader'
                }
            }
        ]
    }
};