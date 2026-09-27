const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const mockApiResponses = require('./mocks/server-mocks.js');

const { copyPluginPatterns, entryConfig } = require('./env.config.js');

module.exports = (env, options) => {
  return {
    cache: {
      type: 'memory'
    },
    mode: options.mode,
    entry: entryConfig,
    devServer: {
      setupMiddlewares(middlewares, server) {
        if (!server) {
          throw new Error('webpack-dev-server is not defined');
        }

        mockApiResponses(server.app);

        return middlewares;
      },
      port: 3000,
      open: true,
      historyApiFallback: true,
      hot: false,
      client: {
        overlay: false
      }
    },
    devtool: 'source-map',
    // Dev only
    // Target must be set to web for hmr to work with .browserlist
    target: 'web',
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        // Required for MUI v6 ESM subpath imports
        {
          test: /\.m?js$/,
          resolve: { fullySpecified: false },
          include: /node_modules[\\/](@mui|@emotion)[\\/]/
        },
        // Required for @mui/x-data-grid plain CSS files.
        // IMPORTANT: Scoped tightly to @mui/x-data-grid only — broader node_modules scoping
        // can silently skip postcss-loader for other packages that need it, and without any
        // include at all, webpack routes already-transformed style-loader output back through
        // postcss-loader causing a CssSyntaxError on the injected ESM `import` statements.
        {
          test: /\.css$/,
          include: /node_modules[\\/]@mui[\\/]x-data-grid/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(?:scss|css)$/,
          exclude: /node_modules[\\/]@mui[\\/]x-data-grid/,
          use: [
            // We're in dev and want HMR, SCSS is handled in JS
            // In production, we want our css as files
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env']]
                }
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
          type: 'javascript/auto',
          loader: 'file-loader',
          options: {
            publicPath: '../',
            name: '[path][name].[ext]',
            context: path.resolve(__dirname, 'src/assets'),
            emitFile: false
          }
        },
        {
          test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
          type: 'javascript/auto',
          exclude: /images/,
          loader: 'file-loader',
          options: {
            publicPath: '../',
            context: path.resolve(__dirname, 'src/assets'),
            name: '[path][name].[ext]',
            emitFile: false
          }
        }
      ]
    },
    resolve: { extensions: ['.tsx', '.ts', '.js'] },
    output: {
      filename: 'js/[name].bundle.js',
      path: path.resolve(__dirname, '../public/client'),
      publicPath: '/'
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        inject: true,
        minify: false
      }),
      new CopyPlugin(copyPluginPatterns),
      new webpack.DefinePlugin({
        'process.env': {}
      })
    ]
  };
};
