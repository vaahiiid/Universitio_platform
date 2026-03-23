import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { trackEvent } from "@/lib/analytics";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Calendar, Clock, Share2, Loader2, ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { SafeHtmlRenderer } from "@/components/blog/SafeHtmlRenderer";

interface BlogPost {
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
  data: BlogPost[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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

function PostLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
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
          src={post.coverImage}
          alt={post.coverImageAlt}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Calendar className="w-3 h-3" />
          {formatDate(post.publishedAt)}
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
  const [, navigate] = useLocation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    Promise.all([
      apiFetch<BlogPost>(`/blog/${slug}`)
        .then((data) => {
          setPost(data);
          trackEvent("blog_article_view", {
            event_category: "blog",
            event_label: data.title,
            article_slug: data.slug,
            page_path: `/blog/${data.slug}`,
          });
        })
        .catch(() => {
          setNotFound(true);
        }),
      apiFetch<ApiResponse>("/blog?limit=100")
        .then((res) => {
          setAllPosts(res.data);
        })
        .catch(() => {}),
    ]).finally(() => {
      setLoading(false);
    });
  }, [slug]);

  const relatedPosts = useMemo(() => {
    if (!post || allPosts.length === 0) return [];
    const sameCat = allPosts.filter((p) => p.id !== post.id && p.category === post.category);
    const shuffled = [...sameCat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [post, allPosts]);

  if (loading) {
    return <PostLoading />;
  }

  if (notFound || !post) {
    return <PostNotFound />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>{post.metaTitle}</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:image" content={post.coverImage} />
        <meta property="og:type" content="article" />
        <meta name="article:published_time" content={post.publishedAt} />
        <meta name="article:author" content="Universitio" />
        {post.tags.map((tag) => (
          <meta key={tag} name="article:tag" content={tag} />
        ))}
      </Helmet>

      <Navbar />

      <main className="flex-grow pt-20 pb-24">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="gap-2 px-0 text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Button>
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{post.category}</span>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.publishedAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {readTime(post.content)} min read
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">{post.title}</h1>

            {post.highlightedQuote && (
              <blockquote className="border-l-4 border-primary bg-primary/5 px-6 py-4 my-8 italic text-lg text-foreground rounded">
                &ldquo;{post.highlightedQuote}&rdquo;
              </blockquote>
            )}
          </div>

          <div className="mb-12 aspect-[16/9] bg-muted rounded-xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.coverImageAlt}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none mb-12 text-foreground">
            <SafeHtmlRenderer content={post.content} />
          </div>

          <div className="py-8 border-t border-b border-border my-12">
            <div className="flex items-center gap-3 mb-4">
              <Share2 className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-semibold">Share this article</span>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = `${post.title} - ${window.location.href}`;
                  navigator.clipboard.writeText(text);
                }}
              >
                Copy Link
              </Button>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}
