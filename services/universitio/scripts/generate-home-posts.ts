import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { posts as chunk1 } from "../src/data/blog/postsChunk1";
import { posts as chunk2 } from "../src/data/blog/postsChunk2";
import { posts as chunk3 } from "../src/data/blog/postsChunk3";
import { posts as chunk4 } from "../src/data/blog/postsChunk4";
import { posts as chunk5 } from "../src/data/blog/postsChunk5";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface HomePost {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  imageAlt: string;
}

const HOME_POSTS_COUNT = 6;

function generateHomePostsData(): string {
  const allPosts = [...chunk1, ...chunk2, ...chunk3, ...chunk4, ...chunk5];

  const sortedPosts = allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const homePosts: HomePost[] = sortedPosts.slice(0, HOME_POSTS_COUNT).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    image: post.image,
    imageAlt: post.imageAlt,
  }));

  const typeScript = `// AUTO-GENERATED FILE — do not edit manually.
// Run \`pnpm --filter @workspace/universitio build\` (or \`tsx scripts/generate-home-posts.ts\`)
// to regenerate this file from the chunk sources (postsChunk1–postsChunk5).

export interface HomePost {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: string;
  imageAlt: string;
}

export const homePostsData: HomePost[] = [
${homePosts
  .map(
    (post) => `  {
    id: ${post.id},
    slug: \`${post.slug}\`,
    title: \`${post.title}\`,
    date: "${post.date}",
    excerpt: \`${post.excerpt}\`,
    image: "${post.image}",
    imageAlt: \`${post.imageAlt}\`,
  }`
  )
  .join(",\n")}
];
`;

  return typeScript;
}

const homePostsFileContent = generateHomePostsData();
const outputPath = path.join(
  __dirname,
  "../src/data/blog/homePostsData.ts"
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, homePostsFileContent, "utf-8");

console.log(`✓ Home posts data generated: ${outputPath}`);
console.log(
  `✓ Latest posts extracted: ${homePostsFileContent.match(/id: \d+/g)?.length || 0} posts`
);
