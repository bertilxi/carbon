import { root } from "hydrogen/util.ts";
import { spawn } from "node:child_process";
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { environment } from "./environment.ts";
import { raw } from "hono/html";
import { randomUUID } from "node:crypto";

let styleName = "";

export function getStyles() {
  return raw(`<link href="/static/${styleName}" rel="stylesheet" />`);
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

  spawn("npx", [
    "tailwindcss",
    "-i",
    stylesPath,
    "-o",
    path.join(root, "static", styleName),
    environment.WATCH ? "" : "-m",
  ]);
}
