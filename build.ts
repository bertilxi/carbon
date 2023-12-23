import { environment } from "./environment.ts";
import esbuild from "esbuild";

export async function build(filePath: string) {
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
  });

  return result.outputFiles[0].text;
}
