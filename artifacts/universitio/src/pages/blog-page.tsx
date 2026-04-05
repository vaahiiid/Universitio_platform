import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ArrowRight, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { blogPosts } from "@/data/blog/postsData";
import { blogCategories } from "@/data/blog/categoriesData";

const BASE = import.meta.env.BASE_URL;
const POSTS_PER_PAGE = 12;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  const [, navigate] = useLocation();
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const sortedPosts = [...blogPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const featured = sortedPosts[0];
  const remaining = sortedPosts.slice(1);
  const visible = remaining.slice(0, visibleCount);
  const hasMore = visibleCount < remaining.length;

  const allCategories = blogCategories
    .filter((c) => c.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Universitio Blog | Guidance for International Students</title>
        <meta name="description" content="Expert guides and insights for international students studying abroad. Browse articles on UK universities, visas, scholarships, and student experience." />
        <link rel="canonical" href="https://universitio.com/blog" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Universitio Blog",
          "description": "Expert guides and insights for international students studying abroad. Browse articles on UK universities, visas, scholarships, and student experience.",
          "url": "https://universitio.com/blog",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://universitio.com/#website",
            "name": "Universitio",
            "url": "https://universitio.com"
          }
        })}</script>
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <BookOpen className="w-4 h-4" />
              Universitio Blog
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Study Abroad Guides for International Students</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Expert insights, university guides, and practical advice for international students planning to study abroad.
            </p>
          </div>

          <div className="mb-16 pb-12 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">Browse by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {blogCategories.map((cat) => {
                const postCount = blogPosts.filter(p => p.categories.includes(cat.name)).length;
                const isActive = postCount > 0;
                return isActive ? (
                  <Link key={cat.slug} href={`/blog/category/${cat.slug}`}>
                    <span className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center bg-slate-100 text-foreground border border-border hover:border-primary hover:bg-primary/5 hover:text-primary cursor-pointer block">
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{postCount}</div>
                    </span>
                  </Link>
                ) : (
                  <div
                    key={cat.slug}
                    className="w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-center bg-slate-50 text-muted-foreground border border-slate-200 cursor-not-allowed opacity-50"
                  >
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{postCount}</div>
                  </div>
                );
              })}
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
                    src={`${BASE}${featured.image}`}
                    srcSet={`${BASE}${featured.image.replace('.webp', '-400.webp')} 400w, ${BASE}${featured.image.replace('.webp', '-600.webp')} 600w, ${BASE}${featured.image} 1200w`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    alt={featured.imageAlt}
                    width="1200"
                    height="675"
                    fetchPriority="high"
                    decoding="async"
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
                      {formatDate(featured.date)}
                    </span>
                    {featured.categories[0] && (
                      <Link
                        href={`/blog/category/${featured.categorySlugs[0]}`}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full hover:bg-primary/10 transition-colors">
                          {featured.categories[0]}
                        </span>
                      </Link>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                    Read Full Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
            <p className="text-muted-foreground text-sm mt-1">{sortedPosts.length} articles</p>
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
                    srcSet={`${BASE}${post.image.replace('.webp', '-400.webp')} 400w, ${BASE}${post.image.replace('.webp', '-600.webp')} 600w, ${BASE}${post.image} 1200w`}
                    alt={post.imageAlt}
                    width="1200"
                    height="675"
                    loading="lazy"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                      <Link
                        href={`/blog/category/${post.categorySlugs[0]}`}
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      >
                        <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full hover:bg-primary/10 transition-colors">
                          {post.categories[0]}
                        </span>
                      </Link>
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
                Load More Articles ({remaining.length - visibleCount} remaining)
              </Button>
            </div>
          )}

          <div className="mt-20 bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 md:p-14 border border-primary/15 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Need Personalised Guidance?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Our expert consultants are ready to help you navigate your study abroad journey.
              Book a free consultation and take the first step towards your future.
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
