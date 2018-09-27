/* tslint:disable:no-console */

import * as fs from "fs";
import * as path from "path";

import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as Webpack from "webpack";
import * as WebpackDevServer from "webpack-dev-server";

const isProduction = process.env.NODE_ENV === "production";
process.env.WEBPACK_SERVE = process.env.NODE_ENV;

const config: Webpack.Configuration = {
  target: "web",
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? false : "cheap-module-source-map",
  entry: { bundle: "./src/bundle.ts", worker: "./src/worker.ts" },
  output: {
    filename: "[name].js",
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
      template: "./index.html",
      chunks: ["bundle"]
    })
  ],
  performance: {
    hints: isProduction ? false : "warning"
  }
};

async function build(): Promise<void> {
  const compiler = Webpack(config);
  compiler.run(() => {});
}

async function watch(): Promise<void> {
  const compiler = Webpack(config);
  const server = new WebpackDevServer(compiler, {
    allowedHosts: ["localhost", "192.168.1.13", "192.168.1.14"],
    compress: true,
    https: {
      cert: fs.readFileSync(path.resolve(__dirname, "video_streamer.crt")),
      key: fs.readFileSync(path.resolve(__dirname, "video_streamer.key"))
    },
    hot: true
  });
  server.listen(8080);
  // const res = await WebpackServe({}, { config, clipboard: true });
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
