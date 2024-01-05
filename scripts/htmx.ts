import htmx from "htmx.org";

htmx.config.globalViewTransitions = true;

document.addEventListener("load", () => {
  window.htmx = htmx;
});
