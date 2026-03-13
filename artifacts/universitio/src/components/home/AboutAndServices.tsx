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
              <div className="space-y-5 text-lg text-muted-foreground">
                <p>
                  At Universitio, we help students from all around the world apply to trusted schools, colleges, and universities abroad. Whether you're aiming for the world's top-ranked institutions or exploring the right fit for your ambitions, we make the application process simple, personal, and stress-free.
                </p>
                <p>
                  We're a UK-registered education consultancy, proudly approved by the British Council, accredited by ICEF, and a member of the Greater Birmingham Chambers of Commerce. Your privacy matters — we're also registered with the Information Commissioner's Office (ICO).
                </p>
                <p>
                  With years of hands-on experience, our team provides tailored, one-on-one support — from selecting the right course and country to preparing a strong application that stands out.
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

      {/* Merged Services + Pathways Section */}
      <section id="services" className="py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Tailored Pathways for Every Student</h2>
            <p className="text-lg text-muted-foreground">
              From personal statements to PhD proposals — comprehensive support designed around your goals.
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {siteData.services.map((service) => (
              <div key={service.id} className="bg-card rounded-2xl p-7 shadow-sm border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300 text-primary">
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>

          {/* Specialist Pathways */}
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Specialist Guidance</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {siteData.pathways.map((pathway) => (
                <div key={pathway.id} className="bg-white rounded-2xl p-8 border border-border relative overflow-hidden group hover:shadow-md transition-all">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="text-xl font-bold text-foreground mb-3 relative z-10">{pathway.title}</h4>
                  <p className="text-muted-foreground text-sm mb-6 relative z-10 leading-relaxed">
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
        </div>
      </section>
    </>
  );
}
