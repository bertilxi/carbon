import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { raw } from "hono/html";
import { root } from "hydrogen/util.ts";
import memo from "memoizee";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import { spawn } from "node:child_process";
import { sockets } from "./hot-reload.ts";
import { environment } from "./environment.ts";

async function processCss() {
  const stylesPath = path.join(root, "styles.css");
  const hasCss = await stat(stylesPath).then(
    () => true,
    () => false,
  );

  if (!hasCss) {
    return "";
  }

  const css = await readFile(stylesPath, "utf8");

  const result = await postcss(
    [tailwindcss, autoprefixer, cssnano].filter(Boolean),
  ).process(css, { from: undefined });

  return result.css;
}

export const getCss = memo(processCss);

export async function watchCss() {
  const stylesPath = path.join(root, "styles.css");
  const hasCss = await stat(stylesPath).then(
    () => true,
    () => false,
  );

  if (!hasCss) {
    return "";
  }

  await mkdir(path.join(root, "static"), { recursive: true }).catch(
    () => void 0,
  );

  const tailwind = spawn("npx", [
    "tailwindcss",
    "-i",
    stylesPath,
    "-o",
    path.join(root, "static", "styles.css"),
    "--watch",
  ]);

  tailwind.stdout.on("data", handleTailwindWatch);
  tailwind.stderr.on("data", handleTailwindWatch);
}

function handleTailwindWatch(value: string) {
  const canRefresh = value.includes("Done");

  if (!canRefresh) {
    return;
  }

  for (const socket of sockets) {
    setImmediate(() => socket.send("refresh"));
  }
}

export async function getStyles() {
  if (environment.WATCH) {
    const styles = await readFile(
      path.join(root, "static", "styles.css"),
      "utf8",
    ).catch(() => "");

    return raw(`<style>${styles}</style>`);
  }

  return raw(`<style>${await getCss()}</style>`);
}
