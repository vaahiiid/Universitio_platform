import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, Calendar, ChevronRight, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { BLOG_CATEGORIES } from "@/lib/blog-constants";

const BASE = import.meta.env.BASE_URL;
const POSTS_PER_PAGE = 12;

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  tags: string[];
  coverImage: string;
  coverImageAlt: string;
  highlightedQuote?: string;
  content: string;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface ApiResponse {
  data: BlogPostData[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function getExcerpt(htmlContent: string, length: number = 150) {
  const text = htmlContent.replace(/<[^>]+>/g, "").trim();
  return text.length > length ? text.substring(0, length) + "..." : text;
}

export default function BlogPage() {
  const [, navigate] = useLocation();
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    apiFetch<ApiResponse>("/blog?limit=100&status=published")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch blog posts:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const featured = posts[0];
  const remaining = posts.slice(1);
  const visible = remaining.slice(0, visibleCount);
  const hasMore = visibleCount < remaining.length;

  // Get unique categories from posts
  const categoriesInUse = Array.from(new Set(posts.map((p) => p.category)))
    .filter((cat) => BLOG_CATEGORIES.includes(cat))
    .sort();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Universitio Blog | Guidance for International Students</title>
        <meta name="description" content="Expert guides and insights for international students studying abroad. Browse articles on UK universities, visas, scholarships, and student experience." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <BookOpen className="w-4 h-4" />
              Universitio Blog
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Insights & Guidance</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert insights, university guides, and practical advice for international students planning to study abroad.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No blog posts published yet.</p>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  <button className="px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap bg-primary text-white border-primary shadow-md">
                    All
                  </button>
                  {categoriesInUse.map((cat) => (
                    <button key={cat} className="px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap bg-white text-foreground border-border hover:border-primary hover:text-primary transition-all">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {featured && (
                <article
                  className="group mb-12 bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/blog/${featured.slug}`)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-[16/10] md:aspect-auto w-full bg-muted overflow-hidden">
                      <img
                        src={featured.coverImage}
                        alt={featured.coverImageAlt}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-4">
                        Featured Article
                      </span>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(featured.publishedAt)}
                        </span>
                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                          {featured.category}
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground mb-6 line-clamp-2">{getExcerpt(featured.content, 200)}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors w-fit">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              )}

              {visible.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {visible.map((post) => (
                    <article
                      key={post.id}
                      className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.coverImageAlt}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">{getExcerpt(post.content, 100)}</p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors w-fit">
                          Read More <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {hasMore && (
                <div className="text-center">
                  <Button onClick={() => setVisibleCount(visibleCount + POSTS_PER_PAGE)} variant="outline" className="rounded-full px-8">
                    Load More Articles <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
