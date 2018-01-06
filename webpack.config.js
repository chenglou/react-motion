'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Temporary fix for css-loader/post-css
// 'Module build failed: ReferenceError: Promise is not defined'
require('babel/polyfill');

var webpack = require('webpack');
var path = require('path');

var loaders = ['babel'];
var port = process.env.PORT || 3000;

var devtool;
var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];
var entry = {
  'demo0-simple-transition': './demos/demo0-simple-transition/index.jsx',
  'demo1-chat-heads': './demos/demo1-chat-heads/index.jsx',
  'demo2-draggable-balls': './demos/demo2-draggable-balls/index.jsx',
  'demo3-todomvc-list-transition': './demos/demo3-todomvc-list-transition/index.jsx',
  'demo4-photo-gallery': './demos/demo4-photo-gallery/index.jsx',
  'demo5-spring-parameters-chooser': './demos/demo5-spring-parameters-chooser/index.jsx',
  'demo7-water-ripples': './demos/demo7-water-ripples/index.jsx',
  'demo8-draggable-list': './demos/demo8-draggable-list/index.jsx',
};

if (process.env.NODE_ENV === 'development') {
  devtool ='eval-source-map';
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin()
  ]);
  entry = Object.keys(entry).reduce(function (result, key) {
    result[key] = [
      'react-hot-loader/patch',
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
    }, {
      test: /\.css$/,
      loaders: ['style', 'css']
    }],
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint', exclude: /build|lib|bower_components|node_modules/},
    ],
    noParse: [
      path.join(__dirname, 'node_modules', 'babel-core', 'browser.min.js')
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: plugins,
  eslint: {configFile: '.eslintrc'},
};
