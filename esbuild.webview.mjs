import { build } from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";

build({
  entryPoints: ["src/webview/react/index.tsx"],
  bundle: true,
  outfile: "src/webview/main.js",
  minify: true,
  sourcemap: true,
  plugins: [sassPlugin({ type: "css", cssModules: true })],
  loader: { ".png": "file", ".svg": "file" },
  logLevel: "info",
}).catch(() => process.exit(1));