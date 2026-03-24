export interface BlogCategory {
  slug: string;
  name: string;
  parent: string | null;
  postCount: number;
}

export const blogCategories: BlogCategory[] = [
  { slug: "uk-universities", name: "UK Universities", parent: null, postCount: 0 },
  { slug: "us-universities", name: "US Universities", parent: null, postCount: 0 },
  { slug: "eu-universities", name: "EU Universities", parent: null, postCount: 0 },
  { slug: "ca-universities", name: "CA Universities", parent: null, postCount: 0 },
  { slug: "education-news", name: "Education News", parent: null, postCount: 0 },
  { slug: "student-guides", name: "Student Guides", parent: null, postCount: 0 },
];
