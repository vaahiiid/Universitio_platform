import { siteData } from "@/data/siteData";
import { Globe } from "lucide-react";

export function GlobalReach() {
  return (
    <>
      {/* Why Choose Us */}
      <section id="why-us" className="py-12 md:py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Students Choose Universitio</h2>
            <p className="text-lg text-primary-foreground/80">
              We stand out by providing genuine, expert, and deeply personalised support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {siteData.whyChooseUs.map((benefit, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-secondary">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-primary-foreground/70 leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section — Flag Grid */}
      <section id="countries" className="py-12 md:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Supporting Students from Around the World</h2>
            <p className="text-lg text-muted-foreground">
              Wherever you're from, we're here to help you take the next step.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {siteData.countries.map((country) => (
              <div
                key={country.name}
                className="bg-card rounded-2xl border border-border shadow-sm px-6 py-5 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <span className="text-4xl drop-shadow-sm">{country.flag}</span>
                <span className="font-semibold text-foreground">{country.name}</span>
              </div>
            ))}

            {/* Open to all card */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/20 shadow-sm px-6 py-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground text-sm leading-snug">
                Students from many other countries are also welcome
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
