var path = require('path');
var querystring = require('querystring');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: [
    'webpack-dev-server/client?http://localhost:3001',
    './src/client'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'client.js',
    publicPath: 'http://localhost:3001/static/'
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx']
  },
  module: {
    loaders: [{
      test: /\.png$/i,
      loader: 'file'
    }, {
      test: /\.css$/i,
      loader: 'raw',
      include: path.join(__dirname, 'src')
    }, {
      test: /\.tsx?$/,
      loader: 'awesome-typescript',
      include: path.join(__dirname, 'src')
    }]
  }
};
