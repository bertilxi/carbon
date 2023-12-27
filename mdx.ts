import { evaluate } from "@mdx-js/mdx";
import { Fragment } from "hono/jsx";
import { jsxDEV } from "hono/jsx/jsx-dev-runtime";
import { readFile } from "node:fs/promises";
import { environment } from "./environment.ts";
import rehypePrettyCode from "rehype-pretty-code";

export async function getContent(filePath: string) {
  const source = await readFile(filePath, "utf8");

  return evaluate(source, {
    development: environment.WATCH,
    rehypePlugins: [[rehypePrettyCode]],
    Fragment,
    jsx: jsxDEV,
    jsxDEV: jsxDEV,
    jsxs: jsxDEV,
  });
}
