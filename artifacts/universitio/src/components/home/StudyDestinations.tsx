import { Globe, ArrowRight } from "lucide-react";

const destinations = ["UK", "USA", "Canada", "Europe"];

export function StudyDestinations() {
  return (
    <section id="destinations" aria-label="Study Destinations" className="py-8 md:py-12 bg-background border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flow Layout */}
        <div className="flex items-center justify-center gap-4 md:gap-6 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {/* Globe Icon with pulse animation */}
          <div className="flex-none">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
          </div>

          {/* Text */}
          <span className="flex-none text-sm md:text-base font-medium text-foreground whitespace-nowrap">
            Students worldwide
          </span>

          {/* Arrow with subtle animation */}
          <div className="flex-none hidden sm:block">
            <div className="relative">
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground animate-[bounce_2s_infinite]" style={{ animationDelay: "0s" }} />
            </div>
          </div>

          {/* Destination Chips */}
          <div className="flex-none flex gap-2 md:gap-3">
            {destinations.map((dest, i) => (
              <div
                key={dest}
                className="inline-block bg-primary/8 border border-primary/20 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-primary whitespace-nowrap hover:bg-primary/12 hover:border-primary/40 transition-all duration-300"
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {dest}
              </div>
            ))}
          </div>
        </div>

        {/* Subtitle */}
        <p className="text-center text-xs md:text-sm text-muted-foreground/70 mt-5 md:mt-6">
          Expert guidance for your global education journey
        </p>
      </div>
    </section>
  );
}
