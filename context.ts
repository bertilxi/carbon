import type { Context } from "hono";
import { createContext, useContext } from "hono/jsx";

export interface HtmlContext {
  c: Context;
  route: string;
  name: string;
  title: string;
  description: string;
  keywords: string;
  publishedAt: string;
}

export const HtmlContext = createContext<HtmlContext | null>(null);

export const useHtmlContext = (): HtmlContext => {
  const c = useContext(HtmlContext);

  if (!c) {
    throw new Error("HtmlContext is not provided.");
  }

  return c;
};
