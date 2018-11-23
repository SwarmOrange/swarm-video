const path = require("path");
const webpack = require("webpack");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WebpackCleanupPlugin = require("webpack-cleanup-plugin");

const webpackBase = require("./webpack.base.js");

const UnminifiedWebpackPlugin = require("unminified-webpack-plugin");

const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = merge(webpackBase, {
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"prod"'
    }),

    new HtmlWebpackPlugin({
      inject: "body",
      template: path.resolve(__dirname, "../src/index.html"),
      minify: {
        caseSensitive: true,
        collapseWhitespace: true
      }
    }),
    new WebpackCleanupPlugin({ exclude: ["index.html"] }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new UnminifiedWebpackPlugin(),
    new ExtractTextPlugin("style.css")
  ]
});
