import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, BookOpen, Mic2 } from "lucide-react";

export function ServicesPreview() {
  const highlights = [
    {
      icon: GraduationCap,
      title: "University Applications",
      description: "End-to-end admissions support for all levels — undergraduate, postgraduate, and beyond."
    },
    {
      icon: BookOpen,
      title: "IELTS Preparation",
      description: "Personalised training and coaching to help you reach your target band score."
    },
    {
      icon: Mic2,
      title: "Interview Coaching",
      description: "Mock sessions and structured practice so you walk into any interview with confidence."
    }
  ];

  return (
    <section id="services-preview" aria-label="Other Services by Universitio" className="py-14 md:py-20 bg-slate-50 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Beyond AI</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">Other Services by Universitio</h2>
          <p className="text-base text-muted-foreground">
            AskiMate gives you instant direction. Our expert team executes the next steps alongside you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/services">
            <Button variant="outline" className="rounded-full border-primary/30 text-primary hover:bg-primary/5 px-8 hover:border-primary/50 transition-all">
              Explore All Services
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
