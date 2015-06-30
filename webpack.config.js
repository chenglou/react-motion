var webpack = require('webpack');

module.exports = {
  entry: {
    index: './index.jsx',
  },
  output: {
    path: './out',
    filename: 'all.js',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /build|node_modules/, loader: 'babel-loader?stage=0'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    }
  })],
};

