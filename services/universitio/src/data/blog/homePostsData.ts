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
  {
    id: 93,
    slug: `scholarship-vs-funding-guide`,
    title: `Scholarship vs Funding: Full Guide for Students`,
    date: "2026-03-25",
    excerpt: `Learn the difference between scholarships, funding, and fully funded programmes. Compare opportunities in the UK, USA, Canada, and Europe.`,
    image: "blog-images/scholarship-vs-funding-guide.webp",
    imageAlt: `Scholarship vs Funding Guide: Fully Funded Programs, Study Abroad Opportunities and Financial Support`,
  },
  {
    id: 92,
    slug: `solent-university-courses-fees-admission`,
    title: `Solent University Guide: Courses, Fees & Admission`,
    date: "2026-03-24",
    excerpt: `Discover Solent University courses, tuition fees, entry requirements, and how to apply. A complete guide for international students in the UK.`,
    image: "blog-images/solent-university-southampton-campus-uk.webp",
    imageAlt: `Solent University Southampton campus UK`,
  },
  {
    id: 1,
    slug: `uk-immigration-reforms-2026-breakdown-of-the-new-rules`,
    title: `UK Immigration Reforms 2026: Breakdown of the New Rules`,
    date: "2026-03-09",
    excerpt: `Introduction In March 2026, the UK government introduced a significant set of immigration reforms aimed at strengthening border control and improving the functioning of the migration system. These cha...`,
    image: "blog-images/united-kingdom-3.webp",
    imageAlt: `UK Immigration Reforms 2026: Breakdown of the New Rules — United Kingdom`,
  },
  {
    id: 2,
    slug: `liverpool-hope-university-education-in-a-historic-citiy`,
    title: `Liverpool Hope University: Education in a Historic Citiy`,
    date: "2026-03-05",
    excerpt: `For international students looking for a university that combines academic quality with a personal learning experience, Liverpool Hope University offers a distinctive option. Located in one of the UK’...`,
    image: "blog-images/uk-universities-3.webp",
    imageAlt: `Liverpool Hope University: Education in a Historic Citiy — UK Universities`,
  },
  {
    id: 3,
    slug: `why-the-uk-is-the-best-place-in-the-world-to-study-right-now`,
    title: `Why the UK Is the Best Place in the World to Study Right Now`,
    date: "2026-03-02",
    excerpt: `Introduction If you’re choosing where to study abroad, the UK should be high on your list—and not just because it’s popular. Right now, the United Kingdom offers a combination of academic excellence, ...`,
    image: "blog-images/united-kingdom-2.webp",
    imageAlt: `Why the UK Is the Best Place in the World to Study Right Now — United Kingdom`,
  },
  {
    id: 4,
    slug: `university-of-brighton-career-focused-uk-education`,
    title: `University of Brighton: Career-Focused UK Education`,
    date: "2026-02-23",
    excerpt: `Introduction For international students who want a UK university combining academic quality with creativity and real-world preparation, the University of Brighton offers an attractive option. Known fo...`,
    image: "blog-images/uk-universities-2.webp",
    imageAlt: `University of Brighton: Career-Focused UK Education — UK Universities`,
  }
];
