import { createLoader } from "@mdx-js/node-loader";
import { root } from "hydrogen/util.ts";
import { readFileSync } from "node:fs";
import path from "node:path";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";

function getTheme() {
  try {
    const theme = readFileSync(
      path.join(root, "static", "code-theme.json"),
      "utf8",
    );
    return JSON.parse(theme);
  } catch {
    //
  }
  return "one-dark-pro";
}

const defaultLoader = createLoader({
  remarkPlugins: [[remarkToc], remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [rehypeAutolinkHeadings, { behavior: "wrap" }],
    [rehypePrettyCode, { theme: getTheme() }],
  ],

  jsxImportSource: "hono/jsx",
});

export const load = defaultLoader.load;
