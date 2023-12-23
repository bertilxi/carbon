import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Handler, MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { readdir, stat } from "node:fs/promises";
import type { Server } from "node:http";
import path from "node:path";
import { environment } from "./environment.ts";
import { logger, loggerMiddleware, setLoggerMetadata } from "./logger.ts";
import { hasStatic, root } from "./util.ts";

let config = {
  pageDir: "pages",
  functionDir: "functions",
};

function setConfig(customConfig: Partial<typeof config>) {
  const newConfig: any = { ...config };
  for (const [key, value] of Object.entries(customConfig)) {
    if (value) {
      newConfig[key] = value;
    }
  }
  config = newConfig;
}

interface StartConfig {
  name?: string;
  port?: number;
  pageDir?: string;
  functionDir?: string;
}

export async function start({
  name = "app",
  port,
  pageDir,
  functionDir,
}: StartConfig = {}) {
  setConfig({
    pageDir,
    functionDir,
  });

  setLoggerMetadata("service", name);

  const app = await setupHono();

  const server = serve({
    hostname: "0.0.0.0",
    port: port ?? environment.PORT,
    fetch: app.fetch,
  }) as Server;

  console.info(`🚀 http://localhost:${environment.PORT}`);

  if (environment.WATCH) {
    import("./hot-reload.ts").then(({ setupHotReload }) =>
      setupHotReload(server)
    );
  }
}

async function setupHono() {
  const app = new Hono();

  app.use("*", loggerMiddleware);

  if (hasStatic) {
    app.use(
      "/static/*",
      (c, next) => {
        c.header(
          "Cache-Control",
          "public, max-age=31536000, s-maxage=31536000"
        );

        return next();
      },
      serveStatic({ root })
    );
  }

  app.notFound((c) => c.text("not found", 404));

  app.onError((error, c) => {
    logger.error(error, error.message);

    return c.json(
      {
        message: error.message || "unexpected error",
        ...(environment.WATCH && { stack: error.stack }),
      },
      (error as any).statusCode ?? 500
    );
  });

  app.get("/health", (c) => c.text("ok"));

  app.post("/sentinel", async (c) => {
    const payload = await c.req.json();
    payload.url = c.req.url;
    logger.info(payload, "🛡️ sentinel");

    return c.body(null, 200);
  });

  await Promise.all([
    generate(config.pageDir, (route, importPath) => {
      app.get(route === "/home" ? "/" : route, async (c) => {
        const { default: Page } = await import(importPath);
        return c.html(<Page c={c} />);
      });
    }),
    generate(config.functionDir, async (route, importPath) => {
      const {
        method = "get",
        middlewares = [],
        handler,
      } = (await import(importPath)) as {
        method: "get" | "post" | "put" | "delete";
        middlewares: MiddlewareHandler[];
        handler: Handler;
      };

      app[method](route, ...middlewares, handler);
    }),
  ]);

  return app;
}

async function generate(
  directory: string,
  handler: (route: string, importPath: string) => void
) {
  const directoryPath = path.join(root, directory);
  const existDirectory = await stat(directoryPath).then(
    () => true,
    () => false
  );

  if (!existDirectory) {
    return;
  }

  let entries = await readdir(path.join(root, directory), {
    recursive: true,
    withFileTypes: true,
  });
  entries = entries.toSorted((a) => (a.name.includes(":") ? 1 : -1));

  for (const entry of entries) {
    if (entry.isDirectory()) {
      continue;
    }

    const route = path
      .join(path.relative(root, entry.path), entry.name)
      .replace(directory, "")
      .replace(path.extname(entry.name), "");
    const importPath = path.join(
      root,
      path.relative(root, entry.path),
      entry.name
    );

    handler(route, importPath);
  }
}
