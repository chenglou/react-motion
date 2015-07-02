var webpack = require('webpack');

function wrapEntry(entry) {
  return [
    entry,
    'webpack-dev-server/client?http://localhost:3000',
    'webpack/hot/only-dev-server'
  ];
}

module.exports = {
  entry: {
    demo1: wrapEntry('./demo1/index.jsx'),
    demo2: wrapEntry('./demo2/index.jsx'),
    demo3: wrapEntry('./demo3/index.jsx'),
    demo4: wrapEntry('./demo4/index.jsx'),
  },
  output: {
    filename: './[name]/all.js',
    publicPath: '/',
    path: '/'
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /build|node_modules/,
      loaders: ['react-hot', 'babel?stage=0']
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]
};

