/* eslint-disable no-undef */

const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const urlDev = "https://localhost:3000/";
const urlProd = "https://www.contoso.com/"; // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

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
      uploadAttachment: "./src/uploadAttachment/uploadAttachment.js",      
      settings: "./src/settings/settings.js"
    },
    output: {
      devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[loaders]",
      clean: true,
    },
    resolve: {
      extensions: [".html", ".js"],
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
            from: "assets/icon-*",
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
            from: "assets/share-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/setting-icon-*",
            to: "assets/[name][ext][query]",
          },
          {
            from: "assets/icons.svg",
            to: "assets/icons.svg",
          },
          {
            from: "assets/attach-icon-*",
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
        chunks: ["polyfill", "login"],
      }),
      new HtmlWebpackPlugin({
        filename: "uploadAttachment.html",
        template: "./src/uploadAttachment/uploadAttachment.html",
        chunks: ["polyfill","filebrowser", "uploadAttachment",  ],
      }),
      new HtmlWebpackPlugin({
        filename: "downLoadfile.html",
        template: "./src/downLoadfile/downLoadfile.html",
        chunks: ["polyfill", "filebrowser", "downloadFile",  ],
      }),
      new HtmlWebpackPlugin({
        filename: "settings.html",
        template: "./src/settings/settings.html",
        chunks: ["polyfill", "settings"],
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
