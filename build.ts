import memo from "memoizee";
import { environment } from "./environment.ts";
import esbuild from "esbuild";

export async function build(
  filePath: string,
  variables?: { [key: string]: string },
) {
  const result = await esbuild.build({
    treeShaking: true,
    minify: !environment.WATCH,
    format: "esm",
    target: [
      "es2020",
      "chrome103",
      "firefox115",
      "safari11",
      "ios15",
      "edge117",
    ],
    platform: "browser",
    write: false,
    bundle: true,
    entryPoints: [filePath],
    define: variables,
  });

  return result.outputFiles[0].text;
}

export const buildCached = memo(build);
