export interface BlogCategory {
  slug: string;
  name: string;
  parent: string | null;
  postCount: number;
}

export const blogCategories: BlogCategory[] = [
  { slug: "businesses-and-startups", name: `Businesses and Startups`, parent: null, postCount: 0 },
  { slug: "countries", name: `Countries`, parent: null, postCount: 0 },
  { slug: "education", name: `Education`, parent: null, postCount: 0 },
  { slug: "education-news", name: `Education News`, parent: null, postCount: 20 },
  { slug: "germany", name: `Germany`, parent: "countries", postCount: 0 },
  { slug: "jobs", name: `Jobs`, parent: null, postCount: 20 },
  { slug: "partner-with-us", name: `Partner with us`, parent: null, postCount: 1 },
  { slug: "scholarships", name: `Scholarships`, parent: null, postCount: 6 },
  { slug: "schools", name: `Schools`, parent: null, postCount: 3 },
  { slug: "student-experience", name: `Student Experience`, parent: null, postCount: 32 },
  { slug: "uncategorized", name: `Uncategorized`, parent: null, postCount: 16 },
  { slug: "unitedkingdom", name: `United Kingdom`, parent: "countries", postCount: 28 },
  { slug: "universities", name: `Universities`, parent: "education", postCount: 0 },
  { slug: "universities-colleges", name: `Universities & Colleges`, parent: null, postCount: 29 },
  { slug: "usa-visas", name: `USA Visas`, parent: null, postCount: 2 },
  { slug: "visa", name: `Visa`, parent: null, postCount: 8 },
  { slug: "canada", name: `Canada`, parent: "countries", postCount: 3 },
  { slug: "canadian-universities", name: `Canadian Universities`, parent: "universities", postCount: 0 },
  { slug: "german-universities", name: `German Universities`, parent: "universities", postCount: 0 },
  { slug: "uk-universities", name: `UK Universities`, parent: "universities", postCount: 91 },
];
