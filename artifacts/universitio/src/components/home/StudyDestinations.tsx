export function StudyDestinations() {
  const destinations = [
    {
      name: "United Kingdom",
      flag: "🇬🇧",
      shortName: "UK",
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&fit=crop",
      featured: true,
    },
    {
      name: "United States",
      flag: "🇺🇸",
      shortName: "USA",
      image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80&fit=crop",
      featured: false,
    },
    {
      name: "Canada",
      flag: "🇨🇦",
      shortName: "Canada",
      image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=600&q=80&fit=crop",
      featured: false,
    },
    {
      name: "Europe",
      flag: "🇪🇺",
      shortName: "Europe",
      image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600&q=80&fit=crop",
      featured: false,
    },
  ];

  return (
    <section id="destinations" aria-label="Study Destinations" className="relative py-16 md:py-24 bg-background overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Global Study Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We support students from 20+ countries applying to the world's best universities
          </p>
        </div>

        {/* Asymmetric Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {/* Featured Card - Large */}
          <div
            className="md:col-span-2 md:row-span-2 group relative rounded-2xl overflow-hidden cursor-default
                       shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <img
              src={destinations[0].image}
              alt={destinations[0].name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{destinations[0].flag}</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold">{destinations[0].shortName}</h3>
              <p className="text-white/80 text-sm mt-2">World-class education & opportunity</p>
            </div>
          </div>

          {/* Smaller Cards - Asymmetric Layout */}
          {destinations.slice(1).map((dest) => (
            <div
              key={dest.shortName}
              className="group relative rounded-2xl overflow-hidden cursor-default
                         shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 text-white">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-lg">{dest.flag}</span>
                </div>
                <h3 className="text-lg md:text-xl font-bold">{dest.shortName}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 md:mt-16">
          <p className="text-sm md:text-base text-muted-foreground">
            Explore pathways to leading universities worldwide
          </p>
        </div>
      </div>
    </section>
  );
}
