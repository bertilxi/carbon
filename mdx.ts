import rehypePrettyCode from "rehype-pretty-code";

import { createLoader } from "@mdx-js/node-loader";

const defaultLoader = createLoader({
  rehypePlugins: [[rehypePrettyCode]],
  jsxImportSource: "hono/jsx",
});

export const load = defaultLoader.load;
