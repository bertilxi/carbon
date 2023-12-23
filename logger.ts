import type { MiddlewareHandler } from "hono";
import pino from "pino";
import type { LokiOptions } from "pino-loki";
import pretty from "pino-pretty";
import { environment } from "./environment.ts";

export function getUtmFields(url: string): Record<string, string> {
  const parsedUrl = new URL(url);
  const utmFields: Record<string, string> = {};

  for (const key of parsedUrl.searchParams.keys()) {
    if (key.startsWith("utm_")) {
      utmFields[key] = parsedUrl.searchParams.get(key) as string;
    }
  }
  return utmFields;
}

const transport = pino.transport<LokiOptions>({
  target: "pino-loki",
  options: {
    host: environment.LOKI_HOST,
    basicAuth: {
      username: environment.LOKI_USER,
      password: environment.LOKI_PASSWORD,
    },
    batching: true,
    interval: 10,
    propsToLabels: ["service", "path", "method", "status", "utm_source"],
  },
});

const streams = [{ stream: environment.WATCH ? pretty({}) : process.stdout }];

if (!environment.WATCH) {
  streams.push({ stream: transport });
}

export const logger = pino({}, pino.multistream(streams));

export function setLoggerMetadata(key: string, value: string) {
  logger.setBindings({ [key]: value });
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
    logger.error(log, message);
    return;
  }

  logger.info(log, message);
};
