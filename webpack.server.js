var path = require('path');
var querystring = require('querystring');
var webpack = require('webpack');

process.env.NODE_ENV = 'development';
process.env.RUN_ENV = 'server';

module.exports = {
  devtool: 'eval',
  entry: [
    './src/env',
    './src/server'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
    publicPath: 'http://localhost:3001/static/',
    libraryTarget: 'commonjs2'
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
      loader: 'file?' + querystring.stringify({
        emitFile: false
      })
    }, {
      test: /\.css$/i,
      loader: 'raw',
      include: path.join(__dirname, 'src')
    }, {
      test: /\.tsx?$/,
      loader: 'awesome-typescript',
      include: path.join(__dirname, 'src')
    }]
  },
  target: 'node',
  // TODO(tim): This approach is low-maintenance yet super slow.
  externals(context, request, cb) {
    try {
      require.resolve(request);
    } catch (err) {
      return cb(null, false);
    }
    cb(null, true);
  }
};
