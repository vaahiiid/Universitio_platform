import { siteData } from "@/data/siteData";

export function TrustIndicators() {
  return (
    <>
      {/* Stats Section - Ultra Compact Data Strip */}
      <section id="stats" aria-label="Key Statistics" className="py-6 md:py-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {siteData.stats.map((stat, index) => (
              <div key={index} className="text-center py-1">
                <div className="text-2xl md:text-3xl font-bold text-secondary leading-tight">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm font-medium text-primary-foreground/80 leading-tight mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Section - Compact with Integrated Pathways Intro */}
      <section id="universities" aria-label="Partner Universities" className="py-8 md:py-10 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Pathways Intro - Ultra Compact */}
          <div className="text-center mb-5 md:mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              Explore Pathways to Leading Institutions Worldwide
            </h3>
          </div>

          {/* University Marquee */}
          <div className="relative flex flex-col gap-3">
            <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent z-10"></div>
            <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent z-10"></div>
            
            <div className="flex w-max animate-[marquee_40s_linear_infinite]">
              <div className="flex gap-3 px-3">
                {[...siteData.universities, ...siteData.universities].slice(0, 20).map((uni, i) => (
                  <div key={i} className="flex-none bg-white border border-border rounded-lg px-5 md:px-6 py-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap text-xs md:text-sm">
                    {uni}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex w-max animate-[marquee-reverse_45s_linear_infinite]">
              <div className="flex gap-3 px-3">
                {[...siteData.universities, ...siteData.universities].reverse().slice(0, 20).map((uni, i) => (
                  <div key={i} className="flex-none bg-white border border-border rounded-lg px-5 md:px-6 py-2 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap text-xs md:text-sm">
                    {uni}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
