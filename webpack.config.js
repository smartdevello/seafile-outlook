/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const urlDev = "https://localhost:3000/";
const urlProd = "https://outlook.lc-testing.de/addin/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { cacert: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const buildType = dev ? "dev" : "prod";
  const config = {    
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      taskpane: "./src/taskpane/taskpane.js",
      commands: "./src/commands/commands.js",
      login: "./src/settings/login.js",
      filebrowser: "./src/helpers/jquery.filebrowser.js",
      downloadFile : "./src/downLoadfile/downLoadfile.js",
      uploadFile: "./src/uploadFile/uploadFile.js",      
      selectDefaultPath: "./src/selectDefaultPath/selectDefaultPath.js",
      settings: "./src/settings/settings.js",
    },
    output: {
      devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[loaders]",
      clean: true,
    },
    resolve: {
      extensions: [".html", ".js"],
      fallback: {
        "crypto": require.resolve("crypto-browserify"),
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: {
            filename: "assets/[name][ext][query]",
          },
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["polyfill", "taskpane"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "assets/icon*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/seafile-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/upload-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/login-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/logout-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/share-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/setting-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/attach-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/grid-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/list-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/select-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/upload-icon.png",
            to: "assets/upload-icon.png",
          },
          {
            from: "assets/download-icon.png",
            to: "assets/download-icon.png",
          },
          {
            from: "assets/grid-icon.png",
            to: "assets/grid-icon.png",
          },
          {
            from: "assets/list-icon.png",
            to: "assets/list-icon.png",
          },
          {
            from: "assets/logo.svg",
            to: "assets/logo.svg",
          },
          {
            from: "assets/login_*",
            to: "assets/[name][ext][query]",
          },
          // {
          //   from: "./src/settings/login.js",
          //   to: "./settings/login.js",
          // },
          {
            from: "manifest*.xml",
            to: "[name]." + buildType + "[ext]",
            transform(content) {
              if (dev) {
                return content;
              } else {
                return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
              }
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["polyfill", "commands"],
      }),
      new HtmlWebpackPlugin({
        filename: "login.html",
        template: "./src/settings/login.html",
        chunks: ["polyfill", "login", ],
      }),
      new HtmlWebpackPlugin({
        filename: "uploadFile.html",
        template: "./src/uploadFile/uploadFile.html",
        chunks: ["polyfill", "filebrowser",  "uploadFile", ],
      }),
      new HtmlWebpackPlugin({
        filename: "downLoadfile.html",
        template: "./src/downLoadfile/downLoadfile.html",
        chunks: ["polyfill", "filebrowser", "downloadFile",  ],
      }),
      new HtmlWebpackPlugin({
        filename: "settings.html",
        template: "./src/settings/settings.html",
        chunks: ["polyfill", "filebrowser", "settings", ],
      }),
      new HtmlWebpackPlugin({
        filename: "selectDefaultPath.html",
        template: "./src/selectDefaultPath/selectDefaultPath.html",
        chunks: ["polyfill", "filebrowser", "selectDefaultPath", ],
      }),
      
    ],
    devServer: {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      https: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      port: process.env.npm_package_config_dev_server_port || 3000,
    },
  };

  return config;
};
