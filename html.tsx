/* eslint-disable unicorn/text-encoding-identifier-case */
import { environment } from "./environment.ts";
import type { Child } from "hono/jsx";
import { getCss } from "./css.ts";
import { Script } from "./script.tsx";
import path from "node:path";
import { hasStatic, root } from "hydrogen/util.ts";
import { stat } from "node:fs/promises";

const configPath = path.join(root, "tailwind.config.ts");
const hasConfig = await stat(configPath).then(
  () => true,
  () => false,
);
const styles = hasConfig
  ? await getCss(await import(configPath).then((m) => m.default))
  : "";
const dirname = new URL(".", import.meta.url).pathname;

interface Properties {
  children: Child;
  title?: string;
  description?: string;
  lang?: string;
  keywords?: string;
  url?: string;
  image?: string;
  color?: string;
  class?: string;
}

export function Html({
  children,
  title,
  description,
  lang,
  keywords,
  url,
  image,
  color,
}: Properties) {
  return (
    <html lang={lang}>
      <head>
        <meta charset="UTF-8" />
        {hasStatic && (
          <>
            <link rel="icon" href="/static/fav.ico" sizes="any" />
            <link rel="icon" href="/static/fav.svg" type="image/svg+xml" />
            <link rel="manifest" href="/static/app.webmanifest" />
          </>
        )}

        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        {image && <meta property="og:image" content={image} />}
        {color && <meta name="theme-color" content={color} />}

        <Script url={import.meta.url} src="./scripts/sentinel.ts" />
        <Script url={import.meta.url} src="./scripts/color-scheme.ts" />

        {styles && <style dangerouslySetInnerHTML={{ __html: styles }} />}
      </head>

      <body hx-boost="true">
        {children}

        <Script url={import.meta.url} src="./scripts/dark-mode.ts" />

        {environment.WATCH && (
          <Script url={import.meta.url} src="./scripts/hot-reload.ts" />
        )}
      </body>
    </html>
  );
}
