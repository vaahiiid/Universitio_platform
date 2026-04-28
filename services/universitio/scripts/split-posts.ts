/**
 * split-posts.ts
 *
 * Regenerates the postsChunk*.ts files and postsLoader.ts from the single source
 * of truth: services/universitio/src/data/blog/postsData.ts
 *
 * Run this script whenever you add or edit blog posts in postsData.ts:
 *
 *   pnpm --filter @workspace/universitio run split-posts
 *
 * The script is fully idempotent — safe to run multiple times.
 * It always writes exactly CHUNK_COUNT chunk files and regenerates postsLoader.ts
 * to keep all dependent tooling in sync.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "../src/data/blog/postsData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, "../src/data/blog");

const CHUNK_COUNT = 5;

function serializePost(post: (typeof blogPosts)[0]): string {
  return JSON.stringify(post, null, 2);
}

function generateChunkFile(posts: typeof blogPosts): string {
  const serialized = posts.map(serializePost).join(",\n");
  return `// AUTO-GENERATED FILE — do not edit manually.
// Run \`pnpm --filter @workspace/universitio run split-posts\`
// to regenerate all chunk files from postsData.ts.

import type { BlogPost } from "./postsData";

export const posts: BlogPost[] = [
${serialized}
];
`;
}

function generateLoaderFile(chunkCount: number): string {
  const imports = Array.from(
    { length: chunkCount },
    (_, i) => `    import("./postsChunk${i + 1}").then((m) => m.posts),`
  ).join("\n");

  return `// AUTO-GENERATED FILE — do not edit manually.
// Run \`pnpm --filter @workspace/universitio run split-posts\`
// to regenerate this file alongside the chunk files.

import type { BlogPost } from "./postsData";
export type { BlogPost };

let cached: BlogPost[] | null = null;

export function loadAllPosts(): Promise<BlogPost[]> {
  if (cached) return Promise.resolve(cached);
  return Promise.all([
${imports}
  ]).then((chunks) => {
    cached = chunks.flat();
    return cached;
  });
}
`;
}

function splitIntoChunks<T>(arr: T[], count: number): T[][] {
  const size = Math.ceil(arr.length / count);
  return Array.from({ length: count }, (_, i) =>
    arr.slice(i * size, (i + 1) * size)
  );
}

function run() {
  const total = blogPosts.length;
  console.log(`→ Found ${total} posts in postsData.ts`);

  const chunks = splitIntoChunks(blogPosts, CHUNK_COUNT);

  chunks.forEach((chunk, idx) => {
    const filePath = path.join(BLOG_DIR, `postsChunk${idx + 1}.ts`);
    const content = generateChunkFile(chunk);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✓ postsChunk${idx + 1}.ts — ${chunk.length} posts`);
  });

  const loaderPath = path.join(BLOG_DIR, "postsLoader.ts");
  const loaderContent = generateLoaderFile(CHUNK_COUNT);
  fs.writeFileSync(loaderPath, loaderContent, "utf-8");
  console.log(`✓ postsLoader.ts regenerated (${CHUNK_COUNT} chunks)`);

  console.log(`\n✓ Done. ${total} posts split across ${CHUNK_COUNT} chunk file(s).`);
}

run();
