'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var webpack = require('webpack');

var loaders = ['babel'];
var port = process.env.PORT || 3000;

var devtool;
var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];
var entry = {
  demo0: './demos/demo0/index.jsx',
  demo1: './demos/demo1/index.jsx',
  demo2: './demos/demo2/index.jsx',
  demo3: './demos/demo3/index.jsx',
  demo4: './demos/demo4/index.jsx',
  demo5: './demos/demo5/index.jsx',
  demo6: './demos/demo6/index.jsx',
  demo7: './demos/demo7/index.jsx',
  demo8: './demos/demo8/index.jsx',
};

if (process.env.NODE_ENV === 'development') {
  devtool ='eval-source-map';
  loaders = ['react-hot'].concat(loaders);
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ]);
  entry = Object.keys(entry).reduce(function (result, key) {
    result[key] = [
      'webpack-dev-server/client?http://0.0.0.0:' + port,
      'webpack/hot/only-dev-server',
      entry[key]
    ];
    return result;
  }, {});
} else {
  devtool ='source-map';
  plugins = plugins.concat([
    new webpack.optimize.OccurenceOrderPlugin()
  ]);
}

module.exports = {
  devtool: devtool,
  entry: entry,
  output: {
    filename: '[name]/all.js',
    publicPath: '/demos/',
    path: __dirname + '/demos/',
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /build|lib|bower_components|node_modules/,
      loaders: loaders
    }],
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint', exclude: /build|lib|bower_components|node_modules/},
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: plugins,
  eslint: {configFile: '.eslintrc'},
};
