var path = require('path');
var querystring = require('querystring');
var webpack = require('webpack');

process.env.NODE_ENV = 'development';
process.env.RUN_ENV = 'client';

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
  plugins: [
    new webpack.EnvironmentPlugin(['NODE_ENV', 'RUN_ENV'])
  ],
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
