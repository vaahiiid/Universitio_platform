import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import { Star, Mail, Phone, ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialProof() {
  return (
    <>
      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">What Our Students Say</h2>
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-border inline-flex">
                <div className="flex text-emerald-500">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-sm font-semibold">Rated 4.6 on Trustpilot</span>
              </div>
            </div>
            <a href="#" className="text-secondary font-medium hover:text-primary transition-colors flex items-center gap-1 group">
              Read all reviews <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteData.testimonials.map((test, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between hover:shadow-lg transition-shadow">
                <div>
                  <div className="flex text-amber-400 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">
                    "{test.quote}"
                  </p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-bold text-foreground text-sm">{test.author}</p>
                  <p className="text-xs text-muted-foreground mt-1">{test.program}</p>
                  <p className="text-xs font-medium text-secondary mt-1">{test.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Latest Insights & Guidance</h2>
            <p className="text-lg text-muted-foreground">
              Expert advice on studying abroad, UK university applications, and student life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {siteData.blogPosts.map((post) => (
              <div key={post.id} className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="aspect-[16/9] w-full bg-muted overflow-hidden">
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
                  <Link href="/blog">
                    <span className="text-sm font-semibold text-foreground border-b-2 border-secondary pb-1 inline-block hover:text-secondary transition-colors">
                      Read More
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="rounded-full px-8 font-semibold">
                Visit Our Blog
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Get in Touch</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Have a question? Ready to start your journey? We'd love to hear from you.
          </p>
          
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Email Us</h4>
                <a href="mailto:info@universitio.co.uk" className="text-sm text-muted-foreground hover:text-primary transition-colors">info@universitio.co.uk</a>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">WhatsApp</h4>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">+44 7XXX XXXXXX</a>
              </div>
              <div className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Telegram</h4>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">@universitio</a>
              </div>
            </div>
            
            <div className="pt-8 border-t border-border">
              <Link href="/free-consultation">
                <Button size="lg" className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 px-12 h-14 text-lg shadow-lg">
                  Book a Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
