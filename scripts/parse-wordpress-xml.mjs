import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const XML_PATH = join(ROOT, 'attached_assets', 'studyintheuk-freeconsultation.WordPress.2026-03-13_1773420401856.xml');
const OUT_DIR = join(ROOT, 'artifacts', 'universitio', 'src', 'data', 'blog');

mkdirSync(OUT_DIR, { recursive: true });

console.log('Reading XML...');
const xml = readFileSync(XML_PATH, 'utf8');

const CATEGORY_IMAGES = {
  'uk-universities':       ['uk-universities-1.jpg','uk-universities-2.jpg','uk-universities-3.jpg','uk-universities-4.jpg'],
  'student-experience':    ['student-experience-1.jpg','student-experience-2.jpg','student-experience-3.jpg'],
  'universities-colleges': ['universities-colleges-1.jpg','universities-colleges-2.jpg','universities-colleges-3.jpg'],
  'unitedkingdom':         ['united-kingdom-1.jpg','united-kingdom-2.jpg','united-kingdom-3.jpg'],
  'education-news':        ['education-news-1.jpg','education-news-2.jpg','education-news-3.jpg'],
  'jobs':                  ['jobs-1.jpg','jobs-2.jpg','jobs-3.jpg'],
  'uncategorized':         ['general-education-1.jpg','general-education-2.jpg','general-education-3.jpg'],
  'visa':                  ['visa-1.jpg','visa-2.jpg','visa-3.jpg'],
  'scholarships':          ['scholarships-1.jpg','scholarships-2.jpg','scholarships-3.jpg'],
  'schools':               ['schools-1.jpg','schools-2.jpg','schools-3.jpg'],
  'canada':                ['canada-1.jpg','canada-2.jpg','canada-3.jpg'],
  'usa-visas':             ['usa-1.jpg','usa-2.jpg'],
  'partner-with-us':       ['partnership-1.jpg','partnership-2.jpg'],
  'businesses-and-startups':['business-1.jpg','business-2.jpg','business-3.jpg'],
  'education':             ['education-news-1.jpg','education-news-2.jpg','education-news-3.jpg'],
  'countries':             ['united-kingdom-1.jpg','united-kingdom-2.jpg','united-kingdom-3.jpg'],
  'universities':          ['universities-colleges-1.jpg','universities-colleges-2.jpg','universities-colleges-3.jpg'],
  'german-universities':   ['germany-1.jpg','germany-2.jpg'],
  'canadian-universities': ['canada-1.jpg','canada-2.jpg','canada-3.jpg'],
  'germany':               ['germany-1.jpg','germany-2.jpg'],
};
const DEFAULT_IMAGES = ['general-education-1.jpg','general-education-2.jpg','general-education-3.jpg'];

const catCounters = {};

function getImageForPost(categorySlugs) {
  const primary = categorySlugs[0] || 'uncategorized';
  const pool = CATEGORY_IMAGES[primary] || DEFAULT_IMAGES;
  if (!catCounters[primary]) catCounters[primary] = 0;
  const idx = catCounters[primary] % pool.length;
  catCounters[primary]++;
  return pool[idx];
}

const wpCategories = [];
const catSlugRe = /<wp:category>[\s\S]*?<wp:category_nicename><!\[CDATA\[([^\]]+)\]\]><\/wp:category_nicename>[\s\S]*?<wp:category_parent><!\[CDATA\[([^\]]*)\]\]><\/wp:category_parent>[\s\S]*?<wp:cat_name><!\[CDATA\[([^\]]+)\]\]><\/wp:cat_name>[\s\S]*?<\/wp:category>/g;
let cm;
while ((cm = catSlugRe.exec(xml)) !== null) {
  wpCategories.push({
    slug: cm[1],
    parent: cm[2] || null,
    name: cm[3].replace(/&amp;/g, '&'),
  });
}

function cleanHtml(html) {
  if (!html) return '';
  let cleaned = html;
  cleaned = cleaned.replace(/<!--\s*\/?wp:[^>]*-->/g, '');
  cleaned = cleaned.replace(/\[[\w_]+[^\]]*\]/g, '');

  cleaned = cleaned.replace(/<div[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/div>/gi, '');

  cleaned = cleaned.replace(/<article[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/article>/gi, '');

  cleaned = cleaned.replace(/ data-section-id="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-start="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-end="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-turn-id="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-turn="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-testid="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-scroll-anchor="[^"]*"/g, '');
  cleaned = cleaned.replace(/ data-message-[a-z-]+="[^"]*"/g, '');
  cleaned = cleaned.replace(/ dir="auto"/g, '');
  cleaned = cleaned.replace(/ tabindex="-1"/g, '');
  cleaned = cleaned.replace(/ class="[^"]*(?:text-token-text|agent-turn|markdown prose|thread-content|text-base my-auto|conversation-turn|text-message|flex-col|min-h-8|wrap-break-word|markdown-new-styling)[^"]*"/g, '');

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  cleaned = cleaned.replace(/^\s+|\s+$/g, '');
  return cleaned;
}

function stripHtmlForExcerpt(html) {
  return html.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function escapeForTs(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

console.log('Parsing posts...');
const itemRe = /<item>([\s\S]*?)<\/item>/g;
let m;
const posts = [];
let idCounter = 1;

while ((m = itemRe.exec(xml)) !== null) {
  const chunk = m[1];
  const type = chunk.match(/<wp:post_type><!\[CDATA\[([^\]]+)\]\]>/)?.[1] || '';
  const status = chunk.match(/<wp:status><!\[CDATA\[([^\]]+)\]\]>/)?.[1] || '';
  if (type !== 'post' || status !== 'publish') continue;

  const slug = chunk.match(/<wp:post_name><!\[CDATA\[([^\]]+)\]\]>/)?.[1] || '';
  const title = (chunk.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1] || '').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8211;/g, '–').replace(/&#8220;/g, '"').replace(/&#8221;/g, '"');
  const dateRaw = chunk.match(/<wp:post_date><!\[CDATA\[([^\]]+)\]\]>/)?.[1] || '';
  const date = dateRaw.slice(0, 10);
  const author = chunk.match(/<dc:creator><!\[CDATA\[([^\]]+)\]\]>/)?.[1] || 'Universitio';

  const contentMatch = chunk.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
  const rawContent = contentMatch?.[1] || '';
  const content = cleanHtml(rawContent);

  const excerptMatch = chunk.match(/<excerpt:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/excerpt:encoded>/);
  let excerpt = excerptMatch?.[1]?.trim() || '';
  if (!excerpt || excerpt === '#tagline' || excerpt.length < 20) {
    const stripped = stripHtmlForExcerpt(content);
    excerpt = stripped.slice(0, 200) + (stripped.length > 200 ? '...' : '');
  }

  const catRe = /<category domain="category" nicename="([^"]+)"><!\[CDATA\[([^\]]+)\]\]><\/category>/g;
  const categories = [];
  const categorySlugs = [];
  let catMatch;
  while ((catMatch = catRe.exec(chunk)) !== null) {
    categorySlugs.push(catMatch[1]);
    categories.push(catMatch[2].replace(/&amp;/g, '&'));
  }

  const tagRe = /<category domain="post_tag"[^>]*><!\[CDATA\[([^\]]+)\]\]><\/category>/g;
  const tags = [];
  let tagMatch;
  while ((tagMatch = tagRe.exec(chunk)) !== null) {
    tags.push(tagMatch[1]);
  }

  const imageFile = getImageForPost(categorySlugs);
  const imageAlt = `${title} — ${categories[0] || 'Universitio Blog'}`;

  posts.push({
    id: idCounter++,
    slug,
    title,
    date,
    author: author === 'meysam' ? 'Universitio Team' : author === 'minadev' ? 'Universitio Team' : author === 'vahid.mo.ir@gmail.com' ? 'Vahid Mohammadi' : author,
    excerpt,
    image: `blog-images/${imageFile}`,
    imageAlt,
    categories,
    categorySlugs,
    tags,
    content,
  });
}

posts.sort((a, b) => b.date.localeCompare(a.date));
posts.forEach((p, i) => p.id = i + 1);

console.log(`Parsed ${posts.length} posts.`);

let postsTs = `export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  imageAlt: string;
  categories: string[];
  categorySlugs: string[];
  tags: string[];
  content: string;
}

export const blogPosts: BlogPost[] = [\n`;

for (const p of posts) {
  postsTs += `  {
    id: ${p.id},
    slug: \`${escapeForTs(p.slug)}\`,
    title: \`${escapeForTs(p.title)}\`,
    date: "${p.date}",
    author: \`${escapeForTs(p.author)}\`,
    excerpt: \`${escapeForTs(p.excerpt)}\`,
    image: "${p.image}",
    imageAlt: \`${escapeForTs(p.imageAlt)}\`,
    categories: ${JSON.stringify(p.categories)},
    categorySlugs: ${JSON.stringify(p.categorySlugs)},
    tags: ${JSON.stringify(p.tags)},
    content: \`${escapeForTs(p.content)}\`,
  },\n`;
}

postsTs += '];\n';

writeFileSync(join(OUT_DIR, 'postsData.ts'), postsTs);
console.log(`Written postsData.ts (${(postsTs.length / 1024 / 1024).toFixed(1)}MB)`);

const catCounts = {};
for (const p of posts) {
  for (const cs of p.categorySlugs) {
    catCounts[cs] = (catCounts[cs] || 0) + 1;
  }
}

let categoriesTs = `export interface BlogCategory {
  slug: string;
  name: string;
  parent: string | null;
  postCount: number;
}

export const blogCategories: BlogCategory[] = [\n`;

for (const cat of wpCategories) {
  categoriesTs += `  { slug: "${cat.slug}", name: \`${escapeForTs(cat.name)}\`, parent: ${cat.parent ? `"${cat.parent}"` : 'null'}, postCount: ${catCounts[cat.slug] || 0} },\n`;
}

categoriesTs += '];\n';

writeFileSync(join(OUT_DIR, 'categoriesData.ts'), categoriesTs);
console.log(`Written categoriesData.ts (${wpCategories.length} categories)`);
console.log('Done!');
