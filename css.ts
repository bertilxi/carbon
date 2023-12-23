import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { readFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import type { Config } from "tailwindcss";
import tailwindcss from "tailwindcss";
import { environment } from "./environment.ts";
import { root } from "./util.ts";

export async function getCss(config: Config) {
  const css = await readFile(path.join(root, "styles.css"), "utf8");

  const result = await postcss(
    [tailwindcss(config), autoprefixer, !environment.WATCH && cssnano].filter(
      Boolean,
    ) as any,
  ).process(css, { from: undefined });

  return result.css;
}
