import type { MiddlewareHandler } from "hono";
import pino from "pino";
import pretty from "pino-pretty";
import { environment } from "./environment.ts";

export function getUtmFields(url: string): Record<string, string> {
  const parsedUrl = new URL(url);
  const utmFields: Record<string, string> = {};

  for (const key of parsedUrl.searchParams.keys()) {
    if (key.startsWith("utm_") || key === "ref") {
      utmFields[key] = parsedUrl.searchParams.get(key) as string;
    }
  }
  return utmFields;
}

const streams = [{ stream: environment.WATCH ? pretty({}) : process.stdout }];

let logger = pino({}, pino.multistream(streams));

export function getLogger() {
  return logger;
}

export function setTransport(stream: any) {
  logger = pino({}, pino.multistream([...streams, stream]));
}

export function setLoggerMetadata(key: string, value: string) {
  getLogger().setBindings({ [key]: value });
}

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const start = Date.now();
  await next();
  const elapsed = Date.now() - start;

  const log = {
    method: c.req.method,
    path: c.req.routePath,
    status: c.res.status,
    elapsed,
    ...getUtmFields(c.req.url),
  };

  const message = `${c.req.method} ${c.req.path} ${c.res.status} ${elapsed} ms`;

  if (c.res.status >= 400) {
    getLogger().error(log, message);
  } else {
    getLogger().info(log, message);
  }
};
