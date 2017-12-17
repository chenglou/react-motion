'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory())
const mergeAll = objects => Object.assign({}, ...objects)

const { NODE_ENV, PORT } = process.env;
const DEMOS_DIR = 'demos';

const port = PORT || 3000;

const jsLoaders = ['babel-loader']

if (NODE_ENV === 'development') {
  jsLoaders.push('react-hot-loader/webpack');
}

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
  })
];

if (NODE_ENV !== 'development') {
  plugins.push(new webpack.optimize.ModuleConcatenationPlugin())
}

const entries = dirs(DEMOS_DIR).map(entryName => {
  const path = `./${DEMOS_DIR}/${entryName}/index.jsx`;

  if (NODE_ENV !== 'development') {
    return { [entryName]: path };
  }

  return {
    [entryName]: [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://0.0.0.0:' + port,
      'webpack/hot/only-dev-server',
      path,
    ],
  };
})

module.exports = {
  devtool: NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
  entry: mergeAll(entries),
  output: {
    filename: '[name]/all.js',
    publicPath: `/${DEMOS_DIR}/`,
    path: __dirname + `/${DEMOS_DIR}/`,
  },
  module: {
    rules: [
      { test: /\.jsx?$/, loader: 'eslint-loader', enforce: 'pre', exclude: /build|lib|bower_components|node_modules/ },
      { test: /\.jsx?$/, use: jsLoaders, exclude: /build|lib|bower_components|node_modules/ },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins,
};
