'use strict';

var path = require('path');
var webpack = require('webpack');

var webpackConfig = {
  devtool: 'eval',
  resolve: {
    extensions: ['', '.js'],
  },
  module: {
    loaders: process.env.COVERAGE ?
      [
        {test: /\.js$/, loader: 'babel', include: [path.resolve('./test')]},
        {test: /\.js$/, loader: 'isparta', include: [path.resolve('./src')]},
      ] :
      [
        {
          test: /\.js$/, loader: 'babel', include: [path.resolve('./src'), path.resolve('./test')],
        },
      ],
  },
  stats: {
    colors: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
};

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'node_modules/babel-core/browser-polyfill.js',
      'test/index.js',
    ],
    webpack: webpackConfig,
    webpackMiddleware: {
      stats: {
        chunkModules: false,
        colors: true,
      },
    },
    exclude: [],
    preprocessors: {
      'test/index.js': ['webpack'],
    },
    reporters: ['progress'],
    coverageReporter: {
      dir: './coverage/',
      subdir: '.',
      reporters: [
        {type: 'html'},
        {type: 'lcovonly'},
        {type: 'text', file: 'text.txt'},
        {type: 'text-summary', file: 'text-summary.txt'},
      ],
    },
    captureTimeout: 90000,
    browserNoActivityTimeout: 60000,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS'],
    singleRun: true,
  });
};
