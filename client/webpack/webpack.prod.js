// Load environment variables from .env file
require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackPwaManifest = require('webpack-pwa-manifest');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const webpackMerge = require('webpack-merge');
const Dotenv = require('dotenv-webpack');

// Import common configuration
const common = require('./webpack.common');

// Define constants for current working directory and environment variables
const CURRENT_WORKING_DIR = process.cwd();
const NODE_ENV = process.env.NODE_ENV;
const API_URL = process.env.API_URL;

const config = {
  // Set mode to production for optimizations
  mode: 'production',
  output: {
    // Output directory for bundled files
    path: path.join(CURRENT_WORKING_DIR, '/dist'),
    filename: 'js/[name].[hash].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        // Process SCSS, SASS, and CSS files
        test: /\.(scss|sass|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [require('cssnano'), require('autoprefixer')]
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
              publicPath: '../images',
              name: '[name].[hash].[ext]'
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
              publicPath: '../fonts',
              name: '[name].[hash].[ext]'
            }
          }
        ]
      }
    ]
  },
  performance: {
    // Disable performance hints
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  optimization: {
    // Enable various optimizations for production
    minimize: true,
    nodeEnv: 'production',
    sideEffects: true,
    concatenateModules: true,
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        styles: {
          test: /\.css$/,
          name: 'styles',
          chunks: 'all',
          enforce: true
        }
      }
    },
    minimizer: [
      // Minify JavaScript files
      new TerserPlugin({
        terserOptions: {
          warnings: false,
          compress: {
            comparisons: false
          },
          parse: {},
          mangle: true,
          output: {
            comments: false,
            ascii_only: true
          }
        }
      })
    ]
  },
  plugins: [
    new Dotenv({
      path: './.env', // Load the correct .env file
    }),
    // Define environment variables for the client-side code
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
        API_URL: JSON.stringify(API_URL)
      }
    }),
    // Generate HTML file with injected script and style tags
    new HtmlWebpackPlugin({
      template: path.join(CURRENT_WORKING_DIR, 'public/index.html'),
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }
    }),
    // Extract CSS into separate files
    new MiniCssExtractPlugin({
      filename: 'css/[name].[hash].css'
    }),
    // Generate a manifest for Progressive Web App
    new WebpackPwaManifest({
      name: 'RMIT Store',
      short_name: 'RMITStore',
      description: 'RMIT Store!',
      background_color: '#fff',
      theme_color: '#4a68aa',
      inject: true,
      ios: true,
      icons: [
        {
          src: path.resolve('public/images/pwa.png'),
          destination: 'images',
          sizes: [72, 96, 128, 144, 192, 384, 512]
        },
        {
          src: path.resolve('public/images/pwa.png'),
          sizes: [120, 152, 167, 180],
          destination: 'images',
          ios: true
        }
      ]
    }),
    // Optimize and minimize CSS assets
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }]
      },
      canPrint: true
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
  }
};

// Merge common configuration with production-specific configuration
module.exports = webpackMerge(common, config);
