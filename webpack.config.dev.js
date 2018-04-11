
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    path.resolve(__dirname, 'view/src/index')
  ],
  target: 'web',
  mode: 'development',
  output: {
    path: __dirname + '/view/dist',
    publicPath: '/',
    filename: 'js/app.[hash].js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'view/src'),

  },
  plugins: [
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({ template: 'view/src/index.html' })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [path.resolve(__dirname, 'node_modules')],
        loader: 'babel-loader',
        options: {
          "presets": ["env", "react", "stage-1"],
          "plugins": ["transform-class-properties", "transform-decorators-legacy"]
        }
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
  // module: {
  //   loaders: [
  //     {test: /\.js$/, exclude: /node_modules/, loaders: ['babel-loader']},
  //     {test: /(\.css)$/, loaders: ['style-loader', 'css-loader']},
  //     {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=./fonts/[hash].[ext]'},
  //     {test: /\.(woff|woff2)$/, loader: 'file-loader?name=./fonts/[hash].[ext]'},
  //     {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=./fonts/[hash].[ext]'},
  //     {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader?name=./fonts/[hash].[ext]'}
  //   ]
  // }
};
