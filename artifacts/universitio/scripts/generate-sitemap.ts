import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "../src/data/blog/postsData";
import { blogCategories } from "../src/data/blog/categoriesData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL_URL = "https://universitio.com";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

function generateSitemap(): string {
  const urls: SitemapUrl[] = [];

  // Static pages
  urls.push(
    { loc: `${CANONICAL_URL}/`, lastmod: "2026-03-24", changefreq: "weekly", priority: "1.00" },
    { loc: `${CANONICAL_URL}/about`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.90" },
    { loc: `${CANONICAL_URL}/contact`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.85" },
    { loc: `${CANONICAL_URL}/blog`, lastmod: "2026-03-24", changefreq: "daily", priority: "0.90" },
    { loc: `${CANONICAL_URL}/free-consultation`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.90" },
    { loc: `${CANONICAL_URL}/assessment-form`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.90" },
    { loc: `${CANONICAL_URL}/partners`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.80" },
    { loc: `${CANONICAL_URL}/student-referral`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.80" },
    { loc: `${CANONICAL_URL}/careers`, lastmod: "2026-03-24", changefreq: "monthly", priority: "0.60" }
  );

  // Category pages (only 6 new categories with posts)
  const categoriesWithPosts = blogCategories.filter(
    (cat) => blogPosts.some((post) => post.categories.includes(cat.name))
  );

  for (const category of categoriesWithPosts) {
    urls.push({
      loc: `${CANONICAL_URL}/blog/category/${category.slug}`,
      lastmod: "2026-03-24",
      changefreq: "weekly",
      priority: "0.75",
    });
  }

  // Blog posts (sorted by date, newest first)
  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const post of sortedPosts) {
    urls.push({
      loc: `${CANONICAL_URL}/blog/${post.slug}`,
      lastmod: post.date,
      changefreq: "monthly",
      priority: "0.70",
    });
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return xml;
}

// Generate and write sitemap
const sitemap = generateSitemap();
const outputPath = path.join(__dirname, "../public/sitemap.xml");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, sitemap, "utf-8");

console.log(`✓ Sitemap generated: ${outputPath}`);
console.log(`✓ Total URLs: ${(sitemap.match(/<url>/g) || []).length}`);
