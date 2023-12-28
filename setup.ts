import { Fragment, jsx } from "hono/jsx";
import { register } from "node:module";

global.React = {
  createElement: jsx,
  Fragment: Fragment,
};

register("./mdx.ts", import.meta.url);
