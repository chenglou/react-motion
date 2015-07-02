var webpack = require('webpack');

module.exports = {
  entry: {
    demo1: './demo1/index.jsx',
    demo2: './demo2/index.jsx',
    demo3: './demo3/index.jsx',
    demo4: './demo4/index.jsx',
  },
  output: {
    // path: './[name]/',
    filename: './[name]/all.js',
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /build|node_modules/, loader: 'babel-loader?stage=0'},
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  // plugins: [new webpack.DefinePlugin({
  //   'process.env': {
  //     NODE_ENV: JSON.stringify('production'),
  //   }
  // })],
};

