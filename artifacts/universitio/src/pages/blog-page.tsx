import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteData } from "@/data/siteData";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowRight, BookOpen, Search, Calendar, ChevronRight
} from "lucide-react";

const CATEGORIES = [
  "All", "University Applications", "UK Study", "Personal Statements",
  "Study Destinations", "Student Life", "Tips & Advice"
];

export default function BlogPage() {
  const allPosts = siteData.blogPosts;
  const featured = allPosts[0];
  const remaining = allPosts.slice(1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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
              Insights, guidance, and updates for international students planning to study abroad.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-sm font-medium">
              WordPress integration coming soon
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  className={`px-5 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                    i === 0
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="ml-auto hidden md:flex items-center gap-2 shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="pl-9 pr-4 py-2 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-56"
                  />
                </div>
              </div>
            </div>
          </div>

          {featured && (
            <article className="group mb-12 bg-white rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="aspect-[16/10] md:aspect-auto w-full bg-muted overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}images/${featured.image}`}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-4">
                    Featured Article
                  </span>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {featured.date}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                    Read Full Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          )}

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Latest Articles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {remaining.map((post) => (
              <article key={post.id} className="group bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}images/${post.image}`}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3 h-3" />
                    {post.date}
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

          <div className="mt-14 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-10 text-sm font-semibold">
              Load More Articles
            </Button>
          </div>

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
