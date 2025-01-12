const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

// Import common configuration
const common = require('./webpack.common');

const CURRENT_WORKING_DIR = process.cwd();

const config = {
  // Set mode to development for better debugging and build speed
  mode: 'development',
  output: {
    // Output directory for bundled files
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        // Process SCSS, SASS, and CSS files
        test: /\.(scss|sass|css)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('autoprefixer')]
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        // Process image files
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]'
            }
          }
        ]
      },
      {
        // Process font files
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // Load environment variables from .env file
    //new Dotenv(),
    new Dotenv({
      path: './.env.development', // Load the correct .env file
    }),
    // Generate HTML file with injected script and style tags
    new HtmlWebpackPlugin({
      template: path.join(CURRENT_WORKING_DIR, 'public/index.html'),
      inject: true
    })
  ],
  devServer: {
    // Configuration for webpack-dev-server
    port: 8080,
    host: '0.0.0.0', // Listen on all network interfaces
    open: true,
    inline: true,
    compress: true,
    hot: true,
    disableHostCheck: true,
    historyApiFallback: true
  },
  // Enable source maps for easier debugging
  devtool: 'eval-source-map'
};

// Merge common configuration with development-specific configuration
module.exports = webpackMerge(common, config);
