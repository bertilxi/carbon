import { build } from "./build.ts";

const scriptCache: Map<string, string> = new Map();

async function getScript(
  filePath: string,
  variables: Record<string, any> = {},
) {
  let content = scriptCache.get(filePath);

  if (!content) {
    content = await build(filePath);
    scriptCache.set(filePath, content);
  }

  for (const [key, value] of Object.entries(variables)) {
    content = content.replaceAll(
      key,
      typeof value === "object" ? JSON.stringify(value) : value,
    );
  }

  return content;
}

export async function Script({
  src,
  variables = {},
  id,
}: {
  src: string;
  variables?: Record<string, any>;
  id?: string;
}) {
  return (
    <script
      id={id}
      async
      type="module"
      dangerouslySetInnerHTML={{ __html: await getScript(src, variables) }}
    />
  );
}
