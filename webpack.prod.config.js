'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

var webpack = require('webpack');
var path = require('path');

// currently, this is for bower
module.exports = {
  mode: 'development',
  devtool: 'sourcemap',
  entry: {
    index: './src/react-motion.js'
  },
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: 'build/',
    filename: 'react-motion.js',
    sourceMapFilename: 'react-motion.map',
    library: 'ReactMotion',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.(js|jsx)/,
      loader: 'babel-loader'
    }]
  },
  plugins: [],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  externals: {
    'react': {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  },
};
