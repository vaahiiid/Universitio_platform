import { siteData } from "@/data/siteData";

export function TrustIndicators() {
  return (
    <>
      {/* Stats Section - Compact */}
      <section id="stats" aria-label="Key Statistics" className="py-10 md:py-12 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {siteData.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-medium text-primary-foreground/80 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pathways Section - Compact */}
      <section id="universities" aria-label="Partner Universities" className="py-8 md:py-10 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6 md:mb-8">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Explore Pathways to Leading Institutions</h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto line-clamp-2">
            We support applications to a wide range of recognised universities, colleges, and schools globally.
          </p>
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
          
          <div className="flex w-max animate-[marquee_40s_linear_infinite]">
            <div className="flex gap-4 md:gap-5 px-3">
              {[...siteData.universities, ...siteData.universities].slice(0, 16).map((uni, i) => (
                <div key={i} className="flex-none bg-white border border-border rounded-lg px-6 md:px-8 py-2.5 md:py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap text-xs md:text-sm">
                  {uni}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex w-max animate-[marquee-reverse_45s_linear_infinite]">
            <div className="flex gap-4 md:gap-5 px-3">
              {[...siteData.universities, ...siteData.universities].reverse().slice(0, 16).map((uni, i) => (
                <div key={i} className="flex-none bg-white border border-border rounded-lg px-6 md:px-8 py-2.5 md:py-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap text-xs md:text-sm">
                  {uni}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
