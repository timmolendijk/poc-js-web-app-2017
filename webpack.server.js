var path = require('path');
var querystring = require('querystring');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  entry: './src/server',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'server.js',
    publicPath: 'http://localhost:3001/static/',
    libraryTarget: 'commonjs2'
  },
  resolve: {
    extensions: ['', '.js', '.ts', '.tsx']
  },
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
  externals: [
    {
      'style': false
    },
    function (context, request, cb) {
      if (/\.css$/.test(request))
        return cb(null, false);
      cb();
    },
    /^[^\.\/]/
  ]
};
