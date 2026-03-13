import { useState } from "react";
import { siteData } from "@/data/siteData";
import { ChevronDown } from "lucide-react";

export function GlobalReach() {
  const [openCountry, setOpenCountry] = useState<string | null>(null);

  return (
    <>
      {/* Why Choose Us */}
      <section id="why-us" className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Students Choose Universitio</h2>
            <p className="text-lg text-primary-foreground/80">
              We stand out by providing genuine, expert, and deeply personalized support.
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

      {/* Countries Section */}
      <section id="countries" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Supporting Students from Around the World</h2>
            <p className="text-lg text-muted-foreground">
              Wherever you're from, we're here to help you take the next step.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6 gap-4">
            {siteData.countries.map((country) => (
              <div 
                key={country.name} 
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenCountry(openCountry === country.name ? null : country.name)}
                  className="w-full px-6 py-5 flex items-center justify-between bg-transparent hover:bg-slate-50 transition-colors text-left focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl drop-shadow-sm">{country.flag}</span>
                    <span className="font-semibold text-lg text-foreground">{country.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${openCountry === country.name ? "rotate-180" : ""}`} />
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    openCountry === country.name ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="w-full h-px bg-border mb-4"></div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We support students from {country.name} with personalised guidance for UK and international university applications. Our team understands the local educational context and can help you navigate the transition to studying abroad.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
