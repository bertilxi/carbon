import { Fragment, jsx } from "hono/jsx";
import { register } from "node:module";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.React = {
  createElement: jsx,
  Fragment: Fragment,
};

register("./mdx.ts", import.meta.url);
