'use strict';

var path = require('path');

var withCoverage = process.argv.indexOf('coverage') !== -1 || process.env.COVERAGE;

var webpackConfig = {
  mode: 'development',
  module: {
    rules: withCoverage ?
      [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [path.resolve('./test')]
        },
        {
          test: /\.js$/,
          loader: 'isparta-loader',
          include: [path.resolve('./src')]
        },
      ] :
      [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [path.resolve('./src'), path.resolve('./test')],
        },
      ],
  },
  stats: {
    colors: true,
  }
};

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      './node_modules/@babel/polyfill/browser.js',
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
    reporters: ['jasmine-diff', 'progress'],
    jasmineDiffReporter: {
      pretty: true,
      color: {
        expectedBg: '',
        expectedFg: 'red',
        actualBg: '',
        actualFg: 'green',
        defaultBg: '',
        defaultFg: 'grey'
      }
    },
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
    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
