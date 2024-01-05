import { fileURLToPath } from "node:url";
import { build } from "./build.ts";
import { raw } from "hono/html";
import { createHash } from "node:crypto";

const scriptCache: Map<string, string> = new Map();

function hashFile(filePath: string, variables: Record<string, any> = {}) {
  const data = filePath + JSON.stringify(variables);
  return createHash("sha1").update(data).digest("base64");
}

async function getScript(
  filePath: string,
  variables: Record<string, any> = {},
) {
  const hash = hashFile(filePath, variables);
  let content = scriptCache.get(hash);

  if (!content) {
    content = await build(filePath, variables);
    scriptCache.set(hash, content);
  }

  return content;
}

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
  const fullUrl = fileURLToPath(new URL(src, url));
  const script = await getScript(fullUrl, variables);

  return raw(`<script id="${id}" async type="module">${script}</script>`);
}
