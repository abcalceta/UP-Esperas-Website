const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

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
    entry: {
        main: './src/web/index.js',
    },
    output: {
        filename: '[name]_[contenthash:8].js',
        path: path.resolve(__dirname, 'dist/web'),
        //publicPath: './'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                sourceMap: true,
                extractComments: false,
                terserOptions: {
                    output: {
                        comments: false,
                    },
                },
            }),
            new OptimizeCSSAssetsPlugin({
                cssProcessorPluginOptions: {
                    preset: [
                        'default',
                        {
                            discardComments: {
                                removeAll: true,
                            },
                        },
                    ],
                },
            }),
        ],
        minimize: true,
        mergeDuplicateChunks: true,
        //runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendors: false,
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    priority: 20,
                },
                common: {
                    name: 'common',
                    minChunks: 2,
                    chunks: 'async',
                    reuseExistingChunk: true,
                    enforce: true,
                    priority: 10,
                },
            },
        },
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
            chunkFilename: '[name]_[contenthash:8].css'
        }),
        new CompressionPlugin({
            filename: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|css|htm(l?)|svg|ttf|eot)$/,
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
        new webpack.HashedModuleIdsPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
            {
                test: /\.(png|svg|jp(e?)g|gif)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name]_[contenthash:8].[ext]',
                        outputPath: 'img',
                    }
                }
            },
            {
                test: /\.html$/,
                exclude: /node_modules/,
                use: {
                    loader: 'html-loader?interpolate=require',
                },
            },
        ],
    },
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
            { from: './src/api/templates', to: 'templates' },
        ]),
        new webpack.IgnorePlugin(/\.(css|less)$/),
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
    externals: nodeModules,
};

module.exports = [
    Object.assign({}, common, web),
    Object.assign({}, common, api),
];