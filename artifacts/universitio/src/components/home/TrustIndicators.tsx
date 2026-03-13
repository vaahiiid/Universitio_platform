import { siteData } from "@/data/siteData";
import icefBadge from "@assets/001bG000006Y3MkQAK_badge_1773399029266.webp";
import britishCouncilCert from "@assets/Certification_1773399011626.webp";
import icoLogo from "@assets/Ico_1773399011627.webp";
import birminghamChambers from "@assets/greater-birmingham_1773399011627.webp";
import companiesHouse from "@assets/companies-hous_1773399011626.webp";

export function TrustIndicators() {
  const getLogo = (key: string) => {
    switch (key) {
      case "icef": return <img src={icefBadge} alt="ICEF Accredited" className="h-12 md:h-14 w-auto object-contain" />;
      case "british-council": return <img src={britishCouncilCert} alt="British Council Certified" className="h-12 md:h-14 w-auto object-contain" />;
      case "ico": return <img src={icoLogo} alt="ICO Registered" className="h-12 md:h-14 w-auto object-contain" />;
      case "birmingham-chambers": return <img src={birminghamChambers} alt="Greater Birmingham Chambers" className="h-12 md:h-14 w-auto object-contain" />;
      case "companies-house": return <img src={companiesHouse} alt="UK-Registered Company" className="h-12 md:h-14 w-auto object-contain" />;
      case "trustpilot": return (
        <div className="flex flex-col justify-center">
          <div className="flex text-emerald-500 mb-1">
            <span className="text-2xl">★</span><span className="text-2xl">★</span><span className="text-2xl">★</span><span className="text-2xl">★</span><span className="text-2xl">★</span>
          </div>
          <span className="font-bold text-emerald-600 text-lg">4.6 Trustpilot</span>
        </div>
      );
      default: return null;
    }
  };

  return (
    <>
      {/* Accreditation Strip */}
      <section id="accreditation" className="py-16 md:py-24 bg-slate-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Recognised Credentials. Real Trust. Global Student Support.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {siteData.accreditations.map((acc) => (
              <div key={acc.id} className="bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="shrink-0 flex items-center justify-center min-w-[4rem]">
                  {getLogo(acc.logoKey)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{acc.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{acc.statement}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 bg-primary text-primary-foreground relative overflow-hidden">
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
      <section id="universities" className="py-24 bg-background overflow-hidden">
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