var webpack = require('webpack');
var path = require('path');
var env = process.env.NODE_ENV || 'production';
var entry = {
  demo0: './demo0/index.js',
  demo1: './demo1/index.js',
  demo2: './demo2/index.js',
  demo3: './demo3/index.js',
  demo4: './demo4/index.js',
};


var sources = ['src'].concat(Object.keys(entry)).map(function (dir) {
  return path.resolve(dir);
});


const production = {
  devtool: 'source-map',
  entry: entry,
  output: {
    filename: './[name]/all.js',
    publicPath: '/',
    path: path.resolve('./'),
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"' + env + '"',
      },
    }),
  ],

  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', include: sources},
    ],
  },
  resolve: {extensions: ['', '.js']},
  stats: {colors: true},
};


const development = {
  devtool: 'eval',

  entry: Object.keys(entry).reduce(function (result, key) {
    result[key] = [
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      entry[key],
    ];
    return result;
  }, {}),
  output: {
    filename: './[name]/all.js',
    publicPath: '/',
    path: path.resolve('./'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"' + env + '"',
      },
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
  ],
  module: {
    loaders: [
      {test: /\.js$/, loaders: ['react-hot', 'babel'], include: sources},
    ],
    preLoaders: [
      {test: /\.js$/, loaders: ['eslint'], include: sources},
    ],
  },
  resolve: {extensions: ['', '.js']},
  stats: {colors: true},
  eslint: {configFile: 'src/.eslintrc'},
};


module.exports = env === 'production' ? production : development;
