import { Fragment, jsx } from "hono/jsx";

global.React = {
  createElement: jsx,
  Fragment: Fragment,
};
