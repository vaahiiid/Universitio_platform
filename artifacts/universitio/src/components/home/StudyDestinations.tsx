const destinations = [
  {
    country: "UK",
    flag: "🇬🇧",
    colour: "from-[#42147d] to-[#6b3fa0]",
  },
  {
    country: "USA",
    flag: "🇺🇸",
    colour: "from-[#1e3a5f] to-[#2d5f8a]",
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    colour: "from-[#7c2d2d] to-[#a84848]",
  },
  {
    country: "Europe",
    flag: "🇪🇺",
    colour: "from-[#1a4d3e] to-[#2d7a5f]",
  },
];

export function StudyDestinations() {
  return (
    <section id="destinations" aria-label="Study Destinations" className="py-10 md:py-14 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading Section */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Study Abroad, Made Simple
          </h2>
          <p className="text-lg md:text-base text-muted-foreground">
            UK, USA, Canada & Europe — from anywhere in the world
          </p>
        </div>

        {/* Destination Cards - Horizontal */}
        <div className="flex overflow-x-auto gap-3 md:gap-4 pb-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 md:justify-center md:overflow-x-visible md:flex-wrap md:pb-0">
          {destinations.map((d) => (
            <div
              key={d.country}
              className={`flex-none md:flex-1 w-40 md:w-auto md:min-w-[140px] bg-gradient-to-br ${d.colour} rounded-xl px-5 py-4 
                           text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-default
                           flex flex-col items-center justify-center text-center`}
            >
              <span className="text-3xl mb-2 leading-none">{d.flag}</span>
              <span className="font-semibold text-sm leading-tight">{d.country}</span>
            </div>
          ))}
        </div>

        {/* Trust Line */}
        <div className="text-center mt-8 md:mt-10">
          <p className="text-sm md:text-base text-muted-foreground/70 font-medium">
            Students from 20+ countries trust Universitio
          </p>
        </div>
      </div>
    </section>
  );
}
