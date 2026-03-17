import { useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { trackEvent } from "@/lib/analytics";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft, ArrowRight, Calendar, Clock, User,
  Share2, Copy, ChevronRight
} from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blog/postsData";

const BASE = import.meta.env.BASE_URL;

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function readTime(content: string) {
  const words = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function PostNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you&apos;re looking for doesn&apos;t exist or may have been moved.
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

function RelatedPostCard({ post }: { post: BlogPost }) {
  const [, navigate] = useLocation();
  return (
    <article
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
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          {formatDate(post.date)}
        </div>
        <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          Read Article <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </article>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    if (post) {
      trackEvent("blog_article_view", {
        event_category: "blog",
        event_label: post.title,
        article_slug: post.slug,
        page_path: `/blog/${post.slug}`,
      });
    }
  }, [post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    const primaryCat = post.categorySlugs[0];
    const sameCat = blogPosts.filter(
      (p) => p.id !== post.id && p.categorySlugs.includes(primaryCat)
    );
    const shuffled = [...sameCat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [post]);

  if (!post) return <PostNotFound />;

  const articleUrl = typeof window !== "undefined"
    ? window.location.href
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>{post.title} | Universitio Blog</title>
        <meta name="description" content={post.excerpt.slice(0, 160)} />
        <link rel="canonical" href={`https://universitio.com/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt.slice(0, 160),
          "datePublished": post.date,
          "image": `https://universitio.com${BASE}${post.image}`,
          "author": { "@type": "Organization", "name": "Universitio", "url": "https://universitio.com" },
          "publisher": { "@type": "Organization", "name": "Universitio", "logo": { "@type": "ImageObject", "url": "https://universitio.com/assets/universitio-logo.png" } },
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://universitio.com/blog/${post.slug}` }
        })}</script>
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            {post.categories[0] && (
              <>
                <Link
                  href={`/blog/category/${post.categorySlugs[0]}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.categories[0]}
                </Link>
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
            <span className="text-foreground font-medium line-clamp-1">{post.title}</span>
          </nav>

          <div className="rounded-3xl overflow-hidden bg-muted mb-8">
            <img
              src={`${BASE}${post.image}`}
              alt={post.imageAlt}
              className="w-full max-h-[480px] object-cover"
              loading="eager"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-4">
            {post.categories.map((cat, i) => (
              <Link key={cat} href={`/blog/category/${post.categorySlugs[i]}`}>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/15 transition-colors">
                  {cat}
                </span>
              </Link>
            ))}
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(post.date)}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime(post.content)} min read
            </span>
          </div>

          <hr className="border-border mb-8" />

          <article
            className="prose prose-slate max-w-none prose-headings:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:mx-auto prose-strong:text-foreground prose-li:marker:text-primary/60 mb-10"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="text-sm font-medium text-muted-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-muted-foreground px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 border-t border-b border-border py-4 mb-12">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              title="Copy link"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + " " + articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("whatsapp_click", { event_category: "contact", event_label: "WhatsApp Button", article_slug: post.slug })}
              className="text-sm text-muted-foreground hover:text-green-600 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-blue-600 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-sky-500 transition-colors"
            >
              X / Twitter
            </a>
          </div>

          {relatedPosts.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-foreground mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((rp) => (
                  <RelatedPostCard key={rp.id} post={rp} />
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between mb-10">
            <Link href="/blog">
              <Button variant="outline" className="rounded-full">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog
              </Button>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-10 md:p-14 border border-primary/15 text-center">
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
