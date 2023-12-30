import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import dayjs from "dayjs";

interface PostContent {
  name: string;
  path: string;
  title?: string;
  description?: string;
  keywords?: string;
  publishedAt?: string;
}

interface Post extends PostContent {
  readingTime: number;
  prev?: Post;
  next?: Post;
}

const postsCache = new Map<string, Post[]>();

export async function getPosts(directory: string) {
  const cache = postsCache.get(directory);

  if (cache) {
    return cache;
  }

  let entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  entries = entries
    .filter((entry) => !entry.isDirectory())
    .filter((entry) => !entry.name.startsWith("_"));

  let posts = await Promise.all(
    entries.map(async (entry) => {
      const filename = path.join(entry.path, entry.name);
      const rawContent = await readFile(filename, "utf8");
      const content = (await import(path.join(entry.path, entry.name)).then(
        (m) => ({
          ...m.config,
          path: entry.path.replace(directory, ""),
          name: entry.name,
        }),
      )) as PostContent;

      const readingTime = Math.ceil(rawContent.split(" ").length / 220);

      return { ...content, readingTime };
    }),
  );

  posts = posts
    .sort((a, b) => dayjs(b.publishedAt).diff(a.publishedAt))
    .map((post, index) => ({
      ...post,
      prev: index < posts.length ? posts[index + 1] : undefined,
      next: index > 0 ? posts[index - 1] : undefined,
    }));

  postsCache.set(directory, posts);

  return posts as Post[];
}

export async function getPost(directory: string, name: string) {
  const posts = await getPosts(directory);

  return posts.find((post) => post.name === name);
}
