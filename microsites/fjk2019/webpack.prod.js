const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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

const common = {
    mode: 'production',
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
    devtool: 'source-map',
    entry: './src/web/index.js',
    output: {
        filename: '[name].[contenthash:8].bundle.js',
        path: path.resolve(__dirname, 'dist/web'),
        //publicPath: './'
    },
    optimization: {
        minimize: true,
        mergeDuplicateChunks: true,
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                        return `npm.${packageName.replace('@', '')}`;
                    }
                }
            }
        }
    },
    plugins: [
        new CopyPlugin([
            { from: './src/web/i18n', to: 'i18n' },
        ]),
        new HtmlWebpackPlugin({
            template: './src/web/templates/index.html'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css'
        }),
        new CompressionPlugin({
            filename: '[path].[contenthash:8].br[query]',
            algorithm: 'brotliCompress',
            test: /\.(js|css|htm(l?))$/,
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
            compressionOptions: { level: 11 }
        }),
        new webpack.HashedModuleIdsPlugin()
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
                    loader: 'html-loader?interpolate=require'
                }
            }
        ]
    }
};

const api = {
    target: 'node',
    entry: ['babel-polyfill', './src/api/index.js'],
    output: {
        filename: 'api.bundle.js',
        path: path.resolve(__dirname, 'dist/api'),
        //publicPath: './'
    },
    plugins: [
        new CopyPlugin([
            { from: './src/api/i18n', to: 'i18n' },
        ]),
        new webpack.IgnorePlugin(/\.(css|less)$/)
    ],
    externals: nodeModules
};

module.exports = [
    Object.assign({}, common, web),
    Object.assign({}, common, api)
];