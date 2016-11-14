var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.client');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: false
}).listen(3001, 'localhost', function (err, result) {
  if (err) {
    console.error(err);
  }

  console.log('Client listening at localhost:3001');
});
