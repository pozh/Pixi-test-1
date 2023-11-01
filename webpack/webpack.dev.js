const merge = require("webpack-merge");
const common = require("./webpack.common");

const dev = {
  mode: "development",
  devtool: "inline-source-map",
  // resolve: {
  //   alias: {
  //     'pixi.js': 'pixi.js-legacy'
  //   }
  // },
  devServer: {
    open: true
  }
};

module.exports = merge(common, dev);
