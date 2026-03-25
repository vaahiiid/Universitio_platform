import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, GraduationCap, BookOpen, Mic2 } from "lucide-react";

export function ServicesPreview() {
  const highlights = [
    {
      icon: GraduationCap,
      title: "University Applications",
      description: "End-to-end admissions support for all levels"
    },
    {
      icon: BookOpen,
      title: "IELTS Preparation",
      description: "Personalised training to reach your target score"
    },
    {
      icon: Mic2,
      title: "Interview Coaching",
      description: "Mock sessions and realistic interview practice"
    }
  ];

  return (
    <section id="services-preview" aria-label="Services Overview" className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">How We Support You</h2>
          <p className="text-base text-muted-foreground">
            Comprehensive guidance tailored to your needs, from application to arrival.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-slate-50 rounded-xl p-6 border border-border/60">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/services">
            <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-md hover:shadow-lg transition-all">
              Explore All Services
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
