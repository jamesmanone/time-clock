const webpack = require('webpack');
const path = require('path');

const GLOBALS = {
  'process.env.NODE_ENV': JSON.stringify('production'),
  __DEV__: false
};

module.exports = {
  devtool: 'none',
  entry: path.resolve(__dirname, 'index'),
  target: 'web',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, '../dist/static'),
    publicPath: '/',
    filename: 'serviceworker.js'
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      noInfo: true,
      options: {
        context: '/',
      }
    })
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules']
  },
  module: {
    rules: [
      {test: /\.ts$/, use: 'ts-loader'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?name=./pwa/[name].[ext]'},
      {test: /\.png$/, use: 'file-loader?name=./pwa/[name].[ext]'},
      {test: /\.webmanifest$/, use: 'file-loader?name=./pwa/[name].[ext]'},
      {test: /\.(xml|ico)$/, use: 'file-loader?name=./[name].[ext]'}
    ]
  }
};
