const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const Compressor = require('compression-webpack-plugin');
const ExtractText = require('extract-text-webpack-plugin');

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
    filename: 'js/app.js'
  },
  plugins: [
    new webpack.DefinePlugin(GLOBALS),
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: true
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
      noInfo: true,
      options: {
        context: '/',
      }
    }),
    new Compressor({
      test: /\.js$|\.css$/,
      threshold: 10240,
      deleteOriginalAssets: true
    }),
    new ExtractText('css/[hash].css')
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules', 'clientSrc']
  },
  module: {
    rules: [
      {test: /\.tsx?$/, use: 'ts-loader'},
      {
        test: /\.css$/,
        use: ExtractText.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?name=./fonts/[hash].[ext]'},
      {test: /\.(woff|woff2)$/, use: 'file-loader?name=./fonts/[hash].[ext]'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?name=./fonts/[hash].[ext]'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader?name=./img/[hash].[ext]'}
    ]
  }
};
