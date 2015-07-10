var webpack = require('webpack');

var devtool;
var loaders = ['babel?stage=0'];
var DEV = process.env.NODE_ENV === 'development';
var port = process.env.PORT || 3000;

var plugins = [
  new webpack.DefinePlugin({
    '__DEV__': JSON.stringify(DEV)
  })
];
var entry = {
  0: './examples/0/index.jsx',
  1: './examples/1/index.jsx',
  2: './examples/2/index.jsx',
  3: './examples/3/index.jsx',
  4: './examples/4/index.jsx',
};

if (DEV) {
  devtool = 'eval-source-map';
  loaders = ['react-hot'].concat(loaders);
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]);
  entry = Object.keys(entry).reduce(function (result, key) {
    result[key] = [
      'webpack-dev-server/client?http://localhost:' + port,
      'webpack/hot/only-dev-server',
      entry[key]
    ];
    return result;
  }, {});
} else {
  plugins = plugins.concat([
    new webpack.optimize.OccurenceOrderPlugin()
  ]);
}

module.exports = {
  devtool: devtool,
  entry: entry,
  output: {
    filename: './examples/[name]/all.js',
    publicPath: '/',
    path: __dirname
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /build|node_modules/,
      loaders: loaders
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: plugins
};
