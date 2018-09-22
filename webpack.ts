/* tslint:disable:no-console */

import * as fs from "fs";
import * as path from "path";

import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as Webpack from "webpack";
import * as WebpackServe from "webpack-serve";

const isProduction = process.env.NODE_ENV === "production";
process.env.WEBPACK_SERVE = process.env.NODE_ENV;

const config: Webpack.Configuration = {
  target: "web",
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? false : "cheap-module-source-map",
  entry: "./src/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", "jsx", ".json"]
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        use: ["source-map-loader"],
        enforce: "pre"
      },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/media/[name].[hash:8].[ext]"
            }
          },
          {
            test: /\.(ts|tsx)$/,
            exclude: [/\.(spec|test).(ts|tsx)$/],
            use: [
              {
                loader: "ts-loader",
                options: {
                  // disable type checker - we will use it in fork plugin
                  // transpileOnly: true
                }
              }
            ]
          },
          {
            test: /\.css$/,
            exclude: /node_modules/,
            use: [
              { loader: "style-loader" },
              { loader: "css-loader", options: { importLoaders: 1 } },
              {
                loader: "postcss-loader",
                options: {
                  ident: "postcss",
                  plugins: () => [require("autoprefixer")]
                }
              }
            ]
          },
          {
            exclude: [/\.(js|jsx|mjs)$/, /\.html$/, /\.json$/],
            loader: require.resolve("file-loader"),
            options: {
              name: "static/media/[name].[hash:8].[ext]"
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: "./index.html"
    })
  ],
  performance: {
    hints: isProduction ? false : "warning"
  }
};

async function build(): Promise<void> {
  const compiler = Webpack(config);
  compiler.run(() => {
    console.log("building");
  });
}

async function watch(): Promise<void> {
  const res = await WebpackServe({}, { config, clipboard: true });
  return;
}

enum Command {
  Build = "build",
  Watch = "watch"
}

async function init(): Promise<void> {
  const cmd = process.argv[2] || "build";
  switch (cmd) {
    case Command.Watch: {
      console.log("Watching");
      await watch();
      break;
    }
    case Command.Build:
    default: {
      console.log("Building");
      await build();
      break;
    }
  }
}

init().catch(e => console.log(e));
