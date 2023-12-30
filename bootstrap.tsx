import "./setup.ts";

import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { Context, Handler, MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { html, raw } from "hono/html";
import { jsx, type FC } from "hono/jsx";
import { renderToReadableStream } from "hono/jsx/streaming";
import { hasStatic, root } from "hydrogen/util.ts";
import { readdir, stat } from "node:fs/promises";
import type { Server } from "node:http";
import path from "node:path";
import { environment } from "./environment.ts";
import { getLogger, loggerMiddleware, setLoggerMetadata } from "./logger.ts";

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

type AppHandler = (app: Hono) => void | Promise<void>;
const noop = () => void 0;

interface StartConfig {
  name?: string;
  port?: number;
  pageDir?: string;
  functionDir?: string;
  beforeRoutes?: AppHandler;
  afterRoutes?: AppHandler;
}

export async function start({
  name = "app",
  port,
  pageDir,
  functionDir,
  beforeRoutes = noop,
  afterRoutes = noop,
}: StartConfig = {}) {
  setConfig({
    pageDir,
    functionDir,
  });

  setLoggerMetadata("service", name);

  const app = await setupHono(beforeRoutes, afterRoutes);

  const server = serve({
    hostname: "0.0.0.0",
    port: port ?? environment.PORT,
    fetch: app.fetch,
  }) as Server;

  console.info(`🚀 http://localhost:${port ?? environment.PORT}`);

  if (environment.WATCH) {
    import("hydrogen/hot-reload.ts").then(({ setupHotReload }) =>
      setupHotReload(server),
    );
  }
}

async function setupHono(
  beforeRoutes: AppHandler = noop,
  afterRoutes: AppHandler = noop,
) {
  const app = new Hono();

  app.use("*", loggerMiddleware);

  if (hasStatic) {
    app.use(
      "/static/*",
      (c, next) => {
        c.header(
          "Cache-Control",
          "public, max-age=31536000, s-maxage=31536000",
        );

        return next();
      },
      serveStatic({ root: "./" }),
    );
  }

  app.notFound((c) => c.text("not found", 404));

  app.onError((error, c) => {
    getLogger().error(error, error.message);

    return c.json(
      {
        message: error.message || "unexpected error",
        ...(environment.WATCH && { stack: error.stack }),
      },
      (error as any).statusCode ?? 500,
    );
  });

  app.get("/health", (c) => c.text("ok"));

  app.post("/sentinel", async (c) => {
    const payload = await c.req.json();
    payload.url = c.req.url;
    getLogger().info(payload, "🛡️ sentinel");

    return c.body(null, 200);
  });

  await beforeRoutes(app);

  await Promise.all([
    generate(config.functionDir, [".ts"], functionsHandler(app)),
    generate(config.pageDir, [".tsx"], pagesHandler(app)),
    generate(config.pageDir, [".mdx"], contentHandler(app)),
  ]);

  await afterRoutes(app);

  return app;
}

async function generate(
  directory: string,
  extensions: string[],
  handler: (route: string, importPath: string) => void | Promise<void>,
) {
  const directoryPath = path.join(root, directory);
  const existDirectory = await stat(directoryPath).then(
    () => true,
    () => false,
  );

  if (!existDirectory) {
    return;
  }

  let entries = await readdir(path.join(root, directory), {
    recursive: true,
    withFileTypes: true,
  });
  entries = entries
    .filter((entry) => !entry.name.startsWith("_"))
    .filter((entry) => !entry.isDirectory())
    .filter((entry) => extensions.includes(path.extname(entry.name)))
    .toSorted((a) => (a.name.includes(":") ? 1 : -1));

  return Promise.all(
    entries.map((entry) => {
      const route = path
        .join(path.relative(root, entry.path), entry.name)
        .replace(directory, "")
        .replace(path.extname(entry.name), "");
      const importPath = path.join(
        root,
        path.relative(root, entry.path),
        entry.name,
      );

      return handler(route, importPath);
    }),
  );
}

function functionsHandler(app: Hono) {
  return async (route: string, importPath: string) => {
    const {
      default: handler,
      method = "get",
      middlewares = [],
    } = (await import(importPath)) as {
      method: "get" | "post" | "put" | "delete";
      middlewares: MiddlewareHandler[];
      default: Handler;
    };

    app[method](path.join("api", route), ...middlewares, handler);
  };
}

function pagesHandler(app: Hono) {
  return async (route: string, importPath: string) => {
    const {
      default: Page,
      method = "get",
      middlewares = [],
    } = (await import(importPath)) as {
      method: "get" | "post" | "put" | "delete";
      middlewares: MiddlewareHandler[];
      default: FC;
    };
    const resolvedRoute = route === "/home" ? "/" : route;

    app[method](resolvedRoute, ...middlewares, (c) =>
      render(c, Page, {
        c,
        route: resolvedRoute,
        name: path.basename(importPath),
      }),
    );
  };
}

function contentHandler(app: Hono) {
  return (route: string, importPath: string) => {
    const resolvedRoute = route === "/home" ? "/" : route;

    app.get(resolvedRoute, async (c) => {
      const {
        default: Content,
        config: { layout, ...configs },
      } = (await import(importPath)) as {
        default: FC;
        config: {
          layout: FC;
          title: string;
          description: string;
          keywords: string;
          publishedAt: string;
        };
      };

      const Layout =
        layout ?? ((({ children }) => <>{children}</>) satisfies FC);

      const Page = () => (
        <Layout
          {...configs}
          route={resolvedRoute}
          name={path.basename(importPath)}
        >
          <Content />
        </Layout>
      );

      return render(c, Page);
    });
  };
}

function render(
  c: Context,
  Component: FC,
  properties: Record<string, any> = {},
) {
  const body = html`${raw("<!DOCTYPE html>")}${jsx(Component, properties)}`;

  return c.body(renderToReadableStream(body), {
    headers: {
      "Transfer-Encoding": "chunked",
      "Content-Type": "text/html; charset=UTF-8",
    },
  });
}
