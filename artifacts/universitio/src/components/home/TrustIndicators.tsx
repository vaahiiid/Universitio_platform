import { siteData } from "@/data/siteData";

export function TrustIndicators() {
  return (
    <>
      {/* Stats Section */}
      <section id="stats" aria-label="Key Statistics" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4 divide-x-0 lg:divide-x divide-white/20">
            {siteData.stats.map((stat, index) => (
              <div key={index} className="text-center px-4">
                <div className="text-4xl md:text-5xl font-display font-bold text-secondary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-medium text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Universities Marquee */}
      <section id="universities" aria-label="Partner Universities" className="py-12 md:py-20 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Pathways to Leading Institutions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We support applications to a wide range of recognised universities, colleges, and schools globally.
          </p>
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10"></div>
          
          <div className="flex w-max animate-[marquee_40s_linear_infinite]">
            <div className="flex gap-6 px-3">
              {[...siteData.universities, ...siteData.universities].slice(0, 16).map((uni, i) => (
                <div key={i} className="flex-none bg-white border border-border rounded-xl px-8 py-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap">
                  {uni}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex w-max animate-[marquee-reverse_45s_linear_infinite]">
            <div className="flex gap-6 px-3">
              {[...siteData.universities, ...siteData.universities].reverse().slice(0, 16).map((uni, i) => (
                <div key={i} className="flex-none bg-white border border-border rounded-xl px-8 py-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all font-medium text-foreground whitespace-nowrap">
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