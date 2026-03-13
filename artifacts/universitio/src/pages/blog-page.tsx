import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteData } from "@/data/siteData";
import { Button } from "@/components/ui/button";

export default function BlogPage() {
  // Simulate fetching more posts by duplicating the placeholder data
  const posts = [...siteData.blogPosts, ...siteData.blogPosts.map(p => ({...p, id: p.id + 10}))];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Insights & Guidance</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Stay updated with the latest news, expert tips, and comprehensive guides on international education, university applications, and student life abroad.
            </p>
            <div className="inline-block px-4 py-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-sm font-medium">
              WordPress integration coming soon
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden relative">
                  <img 
                    src={`${import.meta.env.BASE_URL}images/${post.image}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs font-semibold text-secondary mb-3">{post.date}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">{post.excerpt}</p>
                  <span className="text-sm font-semibold text-foreground border-b-2 border-secondary pb-1 inline-block self-start group-hover:text-secondary transition-colors">
                    Read Article
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-8">Load More Articles</Button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
