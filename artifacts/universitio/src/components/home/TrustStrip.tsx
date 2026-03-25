import { useState } from "react";
import { Link } from "wouter";
import { siteData } from "@/data/siteData";
import icefBadge from "@assets/001bG000006Y3MkQAK_badge_1773399029266.webp";
import britishCouncilCert from "@assets/Certification_1773399011626.webp";
import icoLogo from "@assets/Ico_1773399011627.webp";
import birminghamChambers from "@assets/greater-birmingham_1773399011627.webp";
import companiesHouse from "@assets/companies-hous_1773399011626.webp";

const CRED_LOGOS: Record<string, { img: string; alt: string }> = {
  icef: { img: icefBadge, alt: "ICEF Accredited" },
  "british-council": { img: britishCouncilCert, alt: "British Council Certified" },
  ico: { img: icoLogo, alt: "ICO Registered" },
  "birmingham-chambers": { img: birminghamChambers, alt: "Birmingham Chambers" },
  "companies-house": { img: companiesHouse, alt: "UK-Registered Company" },
};

export function TrustStrip() {
  const [hoveredAcc, setHoveredAcc] = useState<string | null>(null);

  return (
    <section className="py-10 md:py-16 bg-slate-50 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Trusted & Accredited
            </h2>
            <p className="text-sm text-muted-foreground">
              Certified by leading UK and international education bodies
            </p>
          </div>

          {/* Logo Strip */}
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {siteData.accreditations
              .filter(acc => acc.logoKey !== "trustpilot")
              .map((acc) => {
                const logo = CRED_LOGOS[acc.logoKey];
                return (
                  <div
                    key={acc.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredAcc(acc.id)}
                    onMouseLeave={() => setHoveredAcc(null)}
                    onClick={() => setHoveredAcc(hoveredAcc === acc.id ? null : acc.id)}
                  >
                    {logo && (
                      <div className="cursor-help">
                        <img
                          src={logo.img}
                          alt={logo.alt}
                          className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                          loading="lazy"
                        />
                        {/* Tooltip */}
                        <div className={`
                          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10
                          bg-foreground text-background text-xs rounded-lg px-3 py-2 w-48
                          text-center whitespace-normal pointer-events-none
                          opacity-0 group-hover:opacity-100 transition-opacity
                          ${hoveredAcc === acc.id ? "opacity-100" : ""}
                        `}>
                          <p className="font-semibold mb-1">{acc.name}</p>
                          <p className="text-[10px]">{acc.statement}</p>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Mini About + Link */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 border border-border/40 text-center space-y-3">
            <p className="text-muted-foreground">
              We help students apply to universities in the UK and worldwide with expert, personalised support.
            </p>
            <Link href="/about">
              <span className="inline-flex items-center text-primary hover:text-primary/80 font-semibold text-sm transition-colors cursor-pointer">
                Learn more about us →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
