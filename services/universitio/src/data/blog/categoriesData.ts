export interface BlogCategory {
  slug: string;
  name: string;
  parent: string | null;
  postCount: number;
}

export const blogCategories: BlogCategory[] = [
  { slug: "united-kingdom", name: "United Kingdom", parent: null, postCount: 0 },
  { slug: "united-states", name: "United States", parent: null, postCount: 0 },
  { slug: "europe", name: "Europe", parent: null, postCount: 0 },
  { slug: "canada", name: "Canada", parent: null, postCount: 0 },
  { slug: "education-news", name: "Education News", parent: null, postCount: 0 },
  { slug: "student-guides", name: "Student Guides", parent: null, postCount: 0 },
];
