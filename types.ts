import type { Context, Handler as HonoHandler, MiddlewareHandler } from "hono";

export type Handler = HonoHandler;
export type Middleware = MiddlewareHandler;
export type PageProperties = {
  c: Context;
};
