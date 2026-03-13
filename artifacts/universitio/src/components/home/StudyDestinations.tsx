import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudyDestinations() {
  return (
    <section id="destinations" className="py-24 bg-gradient-to-br from-slate-900 via-primary to-primary/90 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 tracking-tight">Where We Help You Study</h2>
          <p className="text-lg md:text-xl text-white/80">
            Expert admissions guidance for the world's most sought-after study destinations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {siteData.studyDestinations.map((dest, i) => (
            <div 
              key={i} 
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-3xl md:text-4xl font-display font-bold text-white group-hover:text-secondary-foreground transition-colors">
                  {dest.country}
                </h3>
                <span className="text-5xl md:text-6xl drop-shadow-xl">{dest.flag}</span>
              </div>
              
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                {dest.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
                {dest.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-secondary" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/free-consultation">
            <Button size="lg" className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-10 h-14 text-lg shadow-xl shadow-secondary/20 hover:shadow-secondary/40 hover:-translate-y-1 transition-all group">
              Book a Free Consultation
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}