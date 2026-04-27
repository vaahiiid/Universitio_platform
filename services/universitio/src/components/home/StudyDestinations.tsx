export function StudyDestinations() {
  const destinations = [
    {
      name: "United Kingdom",
      flag: "🇬🇧",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&q=80&fit=crop",
      tagline: "World-class universities",
    },
    {
      name: "United States",
      flag: "🇺🇸",
      image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=500&q=80&fit=crop",
      tagline: "Innovative education",
    },
    {
      name: "Canada",
      flag: "🇨🇦",
      image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=500&q=80&fit=crop",
      tagline: "Top-ranked institutions",
    },
    {
      name: "Europe",
      flag: "🇪🇺",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=500&q=80&fit=crop",
      tagline: "English-taught programmes",
    },
  ];

  return (
    <section id="destinations" aria-label="Study Destinations" className="relative py-14 md:py-20 bg-background">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unified Header Message */}
        <div className="text-center mb-10 md:mb-14 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Students Worldwide, Global Opportunities
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            We support applications from 20+ countries to the UK, USA, Canada, and Europe
          </p>
        </div>

        {/* Clean Uniform Grid - All same size */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className="group relative aspect-square rounded-lg md:rounded-xl overflow-hidden cursor-default shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50"></div>

              {/* Minimal Text Overlay - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                {/* Flag indicator - small and subtle */}
                <div className="text-xs opacity-80 mb-1">{dest.flag}</div>
                
                {/* Country name - concise */}
                <h3 className="text-sm md:text-base font-semibold leading-tight">
                  {dest.name.split(" ")[0]}
                </h3>
                
                {/* Subtext - very small */}
                <p className="text-xs opacity-75 mt-1 hidden md:block">
                  {dest.tagline}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
