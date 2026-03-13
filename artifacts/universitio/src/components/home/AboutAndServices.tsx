import { Link } from "wouter";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteData } from "@/data/siteData";

export function AboutAndServices() {
  return (
    <>
      {/* About Section */}
      <section id="about" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold mb-6">
                About Universitio
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground leading-tight">
                Your Global Gateway to Education Abroad
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  At Universitio, we help students from all around the world apply to trusted schools, colleges, and universities abroad. Whether you're aiming for the world's top-ranked institutions or exploring the right fit for your ambitions, we make the application process simple, personal, and stress-free.
                </p>
                <p>
                  We're a UK-registered education consultancy, proudly approved by the British Council, accredited by ICEF, and a member of the Greater Birmingham Chambers of Commerce. Your privacy matters — we're also registered with the Information Commissioner's Office (ICO).
                </p>
                <p>
                  With years of hands-on experience, our team provides tailored, one-on-one support — from selecting the right course and country to preparing a strong application that stands out. You can get started today, right here on our website.
                </p>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="text-sm font-medium text-foreground">
                  UK Company No. 15168670
                </div>
                <Link href="/free-consultation">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-md hover:shadow-lg transition-all">
                    Book Your Free Consultation
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 relative">
                {/* Using Unsplash for premium context imagery */}
                {/* student at university campus focused happy */}
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80&fit=crop" 
                  alt="Student smiling on campus" 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                    <div className="flex gap-4 items-start">
                      <div className="bg-secondary/20 p-3 rounded-xl">
                        <CheckCircle2 className="w-8 h-8 text-secondary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-foreground">Tailored Support</h4>
                        <p className="text-sm text-muted-foreground mt-1">Every student journey is unique. We provide bespoke application strategies.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Support Your Journey</h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive application services designed to give you the highest chance of success.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {siteData.services.map((service) => (
              <div key={service.id} className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Pathways */}
      <section id="pathways" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored Pathways for Every Student</h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Specialist guidance for unique application circumstances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {siteData.pathways.map((pathway, i) => (
              <div key={pathway.id} className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl p-8 lg:p-10 border border-border relative overflow-hidden group">
                {/* Decorative background shape */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                
                <h3 className="text-2xl font-bold text-foreground mb-4 relative z-10">{pathway.title}</h3>
                <p className="text-muted-foreground mb-8 relative z-10 leading-relaxed h-auto lg:h-[120px] overflow-hidden">
                  {pathway.description}
                </p>
                <Link href={pathway.link}>
                  <Button variant="link" className="p-0 text-secondary font-semibold hover:text-primary relative z-10 group/btn">
                    {pathway.ctaText}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
