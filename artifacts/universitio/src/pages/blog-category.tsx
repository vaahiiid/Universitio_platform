import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { ArrowRight, ArrowLeft, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { blogPosts } from "@/data/blog/postsData";
import { blogCategories } from "@/data/blog/categoriesData";

const BASE = import.meta.env.BASE_URL;
const POSTS_PER_PAGE = 12;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogCategoryPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [, navigate] = useLocation();
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const category = blogCategories.find((c) => c.slug === categorySlug);
  const posts = blogPosts.filter((p) => p.categorySlugs.includes(categorySlug || ""));

  useEffect(() => {
    if (category) {
      document.title = `${category.name} Articles | Universitio Blog`;
      const meta = document.querySelector('meta[name="description"]') || document.createElement("meta");
      meta.setAttribute("name", "description");
      meta.setAttribute("content", `Browse ${posts.length} articles about ${category.name}. Expert guidance and insights for international students from Universitio.`);
      if (!meta.parentElement) document.head.appendChild(meta);
    }
    window.scrollTo(0, 0);
    setVisibleCount(POSTS_PER_PAGE);
  }, [category, categorySlug, posts.length]);

  const allCategoriesSorted = blogCategories
    .filter((c) => c.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount);

  const visible = posts.slice(0, visibleCount);
  const hasMore = visibleCount < posts.length;

  if (!category || posts.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-8">
              No articles found for this category.
            </p>
            <Link href="/blog">
              <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <BookOpen className="w-4 h-4" />
              {category.name}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{category.name}</h1>
            <p className="text-lg text-muted-foreground">
              {posts.length} article{posts.length !== 1 ? "s" : ""} in this category
            </p>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Link href="/blog">
                <button className="px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap bg-white text-foreground border-border hover:border-primary hover:text-primary transition-all">
                  All
                </button>
              </Link>
              {allCategoriesSorted.map((cat) => (
                <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                  <button
                    className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                      cat.slug === categorySlug
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visible.map((post) => (
              <article
                key={post.id}
                className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                  <img
                    src={`${BASE}${post.image}`}
                    alt={post.imageAlt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.date)}
                    </span>
                    {post.categories[0] && (
                      <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                        {post.categories[0]}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    Read Article <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="mt-14 text-center">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-10 text-sm font-semibold"
                onClick={() => setVisibleCount((v) => v + POSTS_PER_PAGE)}
              >
                Load More Articles ({posts.length - visibleCount} remaining)
              </Button>
            </div>
          )}

          <div className="mt-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 md:p-14 border border-primary/15 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need Personalised Guidance?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Our expert consultants are ready to help you navigate your study abroad journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/free-consultation">
                <Button size="lg" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg">
                  Book a Free Consultation <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/assessment-form">
                <Button variant="outline" size="lg" className="rounded-full px-8">
                  Take a Free Assessment
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
