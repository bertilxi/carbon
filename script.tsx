import { raw } from "hono/html";
import { fileURLToPath } from "node:url";
import { buildCached } from "./build.ts";

export async function Script({
  src,
  url,
  variables = {},
  id = "",
}: {
  src: string;
  url: string;
  variables?: Record<string, any>;
  id?: string;
}) {
  const script = await buildCached(fileURLToPath(new URL(src, url)), variables);

  return raw(`<script id="${id}" async type="module">${script}</script>`);
}
