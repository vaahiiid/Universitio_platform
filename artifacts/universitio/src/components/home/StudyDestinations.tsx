import { useState } from "react";

const destinations = [
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    colour: "from-[#42147d] to-[#6b3fa0]",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80&fit=crop",
    tagline: "World-Class Education, Endless Opportunity",
    description: "Home to Oxford, Cambridge, and the Russell Group — the UK offers globally respected degrees, rich cultural diversity, and strong post-study career pathways. We guide you through UCAS applications, personal statements, and admissions interviews. We also assist with research-based programmes that allow international students to bring dependants.",
    highlights: ["Russell Group universities", "UCAS & clearing support", "1–3 year programmes"],
  },
  {
    country: "United States",
    flag: "🇺🇸",
    colour: "from-[#1e3a5f] to-[#2d5f8a]",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80&fit=crop",
    tagline: "Innovation Meets Ambition",
    description: "From Ivy League institutions to leading research universities, the US offers unmatched academic breadth and campus life. We support Common App, SAT/ACT prep guidance, and scholarship strategies.",
    highlights: ["Ivy League & top 100 unis", "Common App support", "Flexible major systems"],
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    colour: "from-[#7c2d2d] to-[#a84848]",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&q=80&fit=crop",
    tagline: "Welcoming, Affordable, World-Ranked",
    description: "Canada combines top-tier education with a welcoming, multicultural society. We help with applications to leading Canadian universities and colleges, with guidance on the best-fit programmes.",
    highlights: ["Affordable tuition", "Post-study work options", "Safe & multicultural"],
  },
  {
    country: "Europe",
    flag: "🇪🇺",
    colour: "from-[#1a4d3e] to-[#2d7a5f]",
    image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80&fit=crop",
    tagline: "English-Taught Programmes Across the Continent",
    description: "Explore English-taught degrees in the Netherlands, Germany, and beyond. Europe offers high-quality education, often at lower costs, with vibrant student cities and rich cultural experiences.",
    highlights: ["Low/no tuition options", "English-taught degrees", "Schengen area access"],
  },
];

export function StudyDestinations() {
  const [active, setActive] = useState(0);
  const dest = destinations[active];

  return (
    <section id="destinations" className="py-12 md:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">Where We Help You Study</h2>
          <p className="text-lg text-muted-foreground">
            Expert admissions guidance for the world's most sought-after study destinations.
          </p>
        </div>

        {/* Desktop: Interactive panel layout */}
        <div className="hidden lg:block">
          {/* Destination tabs */}
          <div className="flex gap-2 mb-8">
            {destinations.map((d, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`flex-1 rounded-xl px-6 py-4 text-left transition-all duration-300 border ${
                  active === i
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-white text-foreground border-border hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <span className="text-2xl mr-3">{d.flag}</span>
                <span className="font-bold">{d.country}</span>
              </button>
            ))}
          </div>

          {/* Active destination panel */}
          <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden">
            <div className="grid grid-cols-5 min-h-[380px]">
              <div className="col-span-2 relative overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.country}
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dest.colour} opacity-60`} />
                <div className="absolute bottom-8 left-8 right-8 z-10">
                  <span className="text-6xl mb-3 block drop-shadow-lg">{dest.flag}</span>
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">{dest.country}</h3>
                  <p className="text-white/80 text-sm mt-1 font-medium">{dest.tagline}</p>
                </div>
              </div>

              <div className="col-span-3 p-10 flex flex-col justify-center">
                <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                  {dest.description}
                </p>

                <div className="flex flex-wrap gap-3 mb-8">
                  {dest.highlights.map((h, j) => (
                    <span
                      key={j}
                      className="bg-primary/5 text-primary border border-primary/15 px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {h}
                    </span>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Stacked cards */}
        <div className="lg:hidden space-y-6">
          {destinations.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl border border-border shadow-md overflow-hidden">
              <div className="relative h-48">
                <img src={d.image} alt={d.country} className="w-full h-full object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${d.colour} opacity-60`} />
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="text-4xl drop-shadow-lg">{d.flag}</span>
                  <h3 className="text-xl font-bold text-white drop-shadow-md mt-1">{d.country}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm font-semibold text-primary mb-2">{d.tagline}</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{d.description}</p>
                <div className="flex flex-wrap gap-2">
                  {d.highlights.map((h, j) => (
                    <span key={j} className="bg-primary/5 text-primary border border-primary/15 px-3 py-1 rounded-full text-xs font-medium">{h}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
