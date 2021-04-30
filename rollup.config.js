import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

/* eslint-disable import/no-default-export */
const config = {
  input: "./src/index.ts",
  output: [
    {
      file: "dist/index.umd.js",
      format: "umd",
      name: "WxFemonitor",
      sourcemap: !process.env.MINIFY
    },
    {
      file: "example/lib/femonitor-wx/index.umd.js",
      format: "umd",
      name: "WxFemonitor",
      sourcemap: !process.env.MINIFY
    }
  ],
  external: [], // eslint-disable-line global-require
  plugins: [
    typescript({
      tsconfig: "tsconfig.prod.json"
    }),
    json(),
    babel({ babelHelpers: "bundled" }),
    commonjs(),
    resolve(),
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};

if (process.env.MINIFY) {
  config.plugins.push(terser());
}

export default config;
