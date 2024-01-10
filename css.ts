import { root } from "hydrogen/util.ts";
import { spawn } from "node:child_process";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { environment } from "./environment.ts";
import { raw } from "hono/html";
import { randomUUID } from "node:crypto";
import { sockets } from "./hot-reload.ts";

let styleName = "";
let styles = "";

async function readStyles() {
  if (!environment.WATCH && styles) {
    return styles;
  }

  styles = await readFile(path.join(root, "static", styleName), "utf8");

  return styles;
}

export async function getStyles() {
  return raw(`<style>${await readStyles()}</style>`);
}

export async function createCss() {
  const stylesPath = path.join(root, "styles.css");

  const hasStyles = await stat(stylesPath).then(
    () => true,
    () => false,
  );

  if (!hasStyles) {
    return;
  }

  await mkdir(path.join(root, "static"), { recursive: true }).catch(
    () => void 0,
  );

  styleName = environment.WATCH ? "styles.css" : `styles.${randomUUID()}.css`;

  const tailwind = spawn("npx", [
    "tailwindcss",
    "-i",
    stylesPath,
    "-o",
    path.join(root, "static", styleName),
    environment.WATCH ? "--watch" : "-m",
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
    socket.send("refresh");
  }
}
