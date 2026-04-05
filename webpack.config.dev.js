const {merge} = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
	mode: "development",
	entry: "./js/app.js",
	devtool: "inline-source-map",
	devServer: {
		liveReload: true,
		hot: true,
		open: true,
		static: ["./"],
		host: "0.0.0.0",
		port: 8080,
		allowedHosts: "all",
	},
});
