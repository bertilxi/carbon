import { stat } from "node:fs/promises";
import path from "node:path";

export const root = path.resolve(process.cwd());
export const hasStatic = await stat(path.join(root, "static")).then(
  () => true,
  () => false
);
