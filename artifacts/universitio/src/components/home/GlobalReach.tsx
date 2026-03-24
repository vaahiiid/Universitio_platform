import { siteData } from "@/data/siteData";
import { Globe } from "lucide-react";

export function GlobalReach() {
  return (
    <section id="countries" aria-label="Global Reach" className="py-12 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h3 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
            Supporting Students from Around the World
          </h3>
          <p className="text-base md:text-lg text-muted-foreground">
            Wherever you're from, we're here to help you take the next step.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {siteData.countries.map((country) => (
            <div
              key={country.name}
              className="group bg-white rounded-2xl border border-border shadow-sm px-5 py-4 flex items-center gap-3 cursor-default
                         hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-primary/5
                         transition-all duration-200"
            >
              <span className="text-3xl drop-shadow-sm leading-none">{country.flag}</span>
              <span className="font-semibold text-foreground text-sm leading-snug">{country.name}</span>
            </div>
          ))}

          {/* Open to all card */}
          <div className="bg-gradient-to-br from-primary/8 to-secondary/8 rounded-2xl border border-primary/20 shadow-sm px-5 py-4 flex items-center gap-3
                          hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-default">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm leading-snug">
              & many more countries welcome
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
