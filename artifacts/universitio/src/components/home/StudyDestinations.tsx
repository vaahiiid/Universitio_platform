export function StudyDestinations() {
  const destinations = [
    { name: "UK", flag: "🇬🇧", color: "from-[#42147d]/20 to-[#6b3fa0]/20", borderColor: "border-[#42147d]/30" },
    { name: "USA", flag: "🇺🇸", color: "from-[#1e3a5f]/20 to-[#2d5f8a]/20", borderColor: "border-[#1e3a5f]/30" },
    { name: "Canada", flag: "🇨🇦", color: "from-[#7c2d2d]/20 to-[#a84848]/20", borderColor: "border-[#7c2d2d]/30" },
    { name: "Europe", flag: "🇪🇺", color: "from-[#1a4d3e]/20 to-[#2d7a5f]/20", borderColor: "border-[#1a4d3e]/30" },
  ];

  return (
    <section id="destinations" aria-label="Study Destinations" className="relative py-16 md:py-24 bg-background overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-40 pointer-events-none"></div>
      <div className="absolute -top-40 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Hero Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4 md:mb-6">
            From Anywhere in the World<br />
            <span className="text-primary">To the Best Study Destinations</span>
          </h2>
        </div>

        {/* Center Message */}
        <div className="text-center mb-14 md:mb-16">
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Students from 20+ countries trust us
          </p>
        </div>

        {/* 2x2 Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {destinations.map((dest) => (
            <div
              key={dest.name}
              className={`group bg-gradient-to-br ${dest.color} border ${dest.borderColor} rounded-2xl md:rounded-3xl p-8 md:p-10 
                           hover:shadow-lg hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 cursor-default
                           flex flex-col items-center justify-center text-center`}
            >
              <span className="text-5xl md:text-6xl mb-4 leading-none drop-shadow-sm">
                {dest.flag}
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                {dest.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Bottom trust line - subtle */}
        <div className="text-center mt-12 md:mt-14">
          <p className="text-sm md:text-base text-muted-foreground/60">
            Expert guidance for your global education journey
          </p>
        </div>
      </div>
    </section>
  );
}
