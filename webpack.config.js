var webpack = require('webpack');

var loaders = ['babel'];
var port = process.env.PORT || 3000;

var plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  })
];
var entry = {
  demo0: './demo0/index.jsx',
  demo1: './demo1/index.jsx',
  demo2: './demo2/index.jsx',
  demo3: './demo3/index.jsx',
  demo4: './demo4/index.jsx',
  demo5: './demo5/index.jsx',
};

if (process.env.NODE_ENV === 'development') {
  devtool = 'eval-source-map';
  loaders = ['react-hot'].concat(loaders);
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin()
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
  entry: entry,
  output: {
    filename: './[name]/all.js',
    publicPath: '/',
    path: __dirname
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /build|lib|node_modules/,
      loaders: loaders
    }],
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint', exclude: /build|lib|node_modules/},
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: plugins,
  eslint: {configFile: '.eslintrc'},
};
