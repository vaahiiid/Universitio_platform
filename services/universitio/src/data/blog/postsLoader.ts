// AUTO-GENERATED FILE — do not edit manually.
// Run `pnpm --filter @workspace/universitio run split-posts`
// to regenerate this file alongside the chunk files.

import type { BlogPost } from "./postsData";
export type { BlogPost };

let cached: BlogPost[] | null = null;

export function loadAllPosts(): Promise<BlogPost[]> {
  if (cached) return Promise.resolve(cached);
  return Promise.all([
    import("./postsChunk1").then((m) => m.posts),
    import("./postsChunk2").then((m) => m.posts),
    import("./postsChunk3").then((m) => m.posts),
    import("./postsChunk4").then((m) => m.posts),
    import("./postsChunk5").then((m) => m.posts),
  ]).then((chunks) => {
    cached = chunks.flat();
    return cached;
  });
}
