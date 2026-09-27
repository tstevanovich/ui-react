const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, '../public'),
    filename: 'index.js'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  externals: [nodeExternals()],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'package.json', to: '.' },
        { from: 'package-lock.json', to: '.' },
        {
          from: 'local-packages/node-microservice-lib/package.json',
          to: 'local-packages/node-microservice-lib/package.json'
        },
        {
          from: 'local-packages/node-microservice-lib/dist',
          to: 'local-packages/node-microservice-lib/dist'
        },
        {
          from: 'local-packages/node-microservice-lib/README.local.md',
          to: 'local-packages/node-microservice-lib/README.local.md'
        }
      ]
    })
  ],
  optimization: {
    minimizer: [
      new TerserPlugin({
        exclude: /node_modules/
      })
    ]
  }
};
