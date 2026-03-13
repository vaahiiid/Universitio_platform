import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StudyDestinations() {
  return (
    <section id="destinations" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">Where We Help You Study</h2>
          <p className="text-lg text-muted-foreground">
            Expert admissions guidance for the world's most sought-after study destinations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {siteData.studyDestinations.map((dest, i) => (
            <div
              key={i}
              className="bg-muted/40 rounded-2xl border border-border p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              <span className="text-5xl mb-5 block">{dest.flag}</span>
              <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {dest.country}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                {dest.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/free-consultation">
            <Button
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white px-10 h-14 text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              Book a Free Consultation
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
