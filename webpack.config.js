const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/client/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(wav|mp3|ogg)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(ttf|woff|woff2)$/,
                type: 'asset/resource'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './public/index.html',
            title: 'Dusk Village'
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'assets', to: 'assets' },
                { from: 'public/fonts', to: 'fonts', noErrorOnMissing: true },
                { from: 'village_layout.json', to: 'village_layout.json' }
            ]
        })
    ],
    devServer: {
        static: [
            { directory: path.join(__dirname, 'public') },
            { directory: path.join(__dirname, 'assets'), publicPath: '/assets' }
        ],
        port: 8080,
    },
    resolve: {
        extensions: ['.js']
    }
};
