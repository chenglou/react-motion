var webpack = require('webpack');
var path = require('path');

var config = {
  entry: {
    index: './Spring.js'
  },
  output: {
    path: path.join(__dirname, 'lib'),
    publicPath: 'lib/',
    filename: 'Spring.js',
    sourceMapFilename: 'Spring.map',
    library: 'Spring',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)/,
      loader: 'babel'
    }]
  },
  plugins: [],
  resolve: {
    extensions: ['', '.js', '.jsx']
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

module.exports = config;

// var devtool;
// var loaders = ['babel'];
// var DEV = process.env.NODE_ENV === 'development';

// var plugins = [
//   new webpack.DefinePlugin({
//     '__DEV__': JSON.stringify(DEV)
//   })
// ];
// var entry = {
//   demo0: './demo0/index.jsx',
//   demo1: './demo1/index.jsx',
//   demo2: './demo2/index.jsx',
//   demo3: './demo3/index.jsx',
//   demo4: './demo4/index.jsx',
// };

// if (DEV) {
//   devtool = 'eval-source-map';
//   loaders = ['react-hot'].concat(loaders);
//   plugins = plugins.concat([
//     new webpack.HotModuleReplacementPlugin(),
//     new webpack.NoErrorsPlugin()
//   ]);
//   entry = Object.keys(entry).reduce(function(result, key) {
//     result[key] = [
//       'webpack-dev-server/client?http://localhost:3000',
//       'webpack/hot/only-dev-server',
//       entry[key]
//     ];
//     return result;
//   }, {});
// } else {
//   plugins = plugins.concat([
//     new webpack.optimize.OccurenceOrderPlugin()
//   ]);
// }

// module.exports = {
//   devtool: devtool,
//   entry: entry,
//   output: {
//     filename: './[name]/all.js',
//     publicPath: '/',
//     path: __dirname
//   },
//   module: {
//     loaders: [{
//       test: /\.jsx?$/,
//       exclude: /build|node_modules/,
//       loaders: loaders
//     }]
//   },
//   resolve: {
//     extensions: ['', '.js', '.jsx']
//   },
//   plugins: plugins
// };
