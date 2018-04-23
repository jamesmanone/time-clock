
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    path.resolve(__dirname, 'index')
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    modules: ['node_modules', 'clientSrc']
  },
  target: 'web',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../dist/static'),
    publicPath: '/',
    filename: 'js/app.js'
  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({ template: 'index.html' })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /(\.css)$/,
        loaders: ['style-loader', 'css-loader']
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=./fonts/[hash].[ext]'
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'file-loader?name=./fonts/[hash].[ext]'
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=./fonts/[hash].[ext]'
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader?name=./fonts/[hash].[ext]'
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'file-loader?name=./img/[hash].[ext]'
      }
    ]
  }
};
