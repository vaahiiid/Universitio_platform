import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import { Star, Mail, Phone, ExternalLink, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";

export function SocialProof() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = (data: any) => {
    setIsSubmitted(true);
  };

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Get in Touch</h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-lg">
                Have a question? Ready to start your journey? We'd love to hear from you. Reach out via email, social media, or drop us a message using the form.
              </p>
              
              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/5 text-primary rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Email Us</h4>
                    <a href="mailto:info@universitio.co.uk" className="text-muted-foreground hover:text-primary transition-colors">info@universitio.co.uk</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">WhatsApp & Telegram</h4>
                    <div className="flex flex-col space-y-1">
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">WhatsApp: +44 7XXX XXXXXX</a>
                      <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Telegram: @universitio</a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Head Office</h4>
                    <p className="text-muted-foreground">
                      44 Birmingham Road, Birmingham,<br /> England, B72 1QQ
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-foreground mb-4">Connect With Us</h4>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all font-bold font-serif">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-border">
                {isSubmitted ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                    <p className="text-muted-foreground">
                      Your message has been sent successfully. A member of our team will get back to you shortly.
                    </p>
                    <Button 
                      className="mt-8" 
                      variant="outline" 
                      onClick={() => setIsSubmitted(false)}
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground mb-6">Send a Message</h3>
                    
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name *</label>
                      <Input 
                        id="name" 
                        {...register("name", { required: true })} 
                        className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                        placeholder="John Doe" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</label>
                        <Input 
                          id="email" 
                          type="email" 
                          {...register("email", { required: true })} 
                          className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                          placeholder="john@example.com" 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
                        <Input 
                          id="phone" 
                          {...register("phone")} 
                          placeholder="+44 7XXX XXXXXX" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject *</label>
                      <Input 
                        id="subject" 
                        {...register("subject", { required: true })} 
                        className={errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""}
                        placeholder="How can we help?" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-foreground">Message *</label>
                      <Textarea 
                        id="message" 
                        {...register("message", { required: true })} 
                        className={`min-h-[120px] ${errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="Please provide details about your inquiry..." 
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base shadow-md">
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}