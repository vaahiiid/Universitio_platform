import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "../src/data/blog/postsData";

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

function generateHomePostsData(): string {
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const homePosts: HomePost[] = sortedPosts.slice(0, 6).map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    image: post.image,
    imageAlt: post.imageAlt,
  }));

  const typeScript = `export interface HomePost {
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
