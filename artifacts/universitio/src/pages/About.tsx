import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Universitio — UK Education Consultancy</title>
        <meta name="description" content="Learn about Universitio, an ICEF-accredited education consultancy helping students apply to universities worldwide with personalised support." />
        <link rel="canonical" href="https://universitio.com/about" />
      </Helmet>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              About Universitio
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Your trusted partner in education — helping students worldwide access the universities they aspire to attend.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

            {/* Our Story */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Our Story</h2>
              <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                <p>
                  At Universitio, we help students from around the world apply to trusted schools, colleges, and universities abroad. Whether you're aiming for top-ranked institutions or searching for the right academic path, we make the application process simple, personal, and stress-free.
                </p>
                <p>
                  Universitio is a UK-registered education consultancy. Our agency owner has completed the British Council Agent &amp; Counsellor Training programme, and we are accredited by ICEF and a member of the Greater Birmingham Chambers of Commerce. We are also registered with the Information Commissioner's Office (ICO), ensuring that your personal data is handled securely and responsibly.
                </p>
              </div>
            </div>

            {/* Accreditations */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Trusted & Accredited</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {siteData.accreditations
                  .filter(acc => acc.logoKey !== "trustpilot")
                  .map((acc) => {
                    const logo = CRED_LOGOS[acc.logoKey];
                    return (
                      <div
                        key={acc.id}
                        className="flex flex-col gap-4 bg-slate-50 rounded-2xl p-6 border border-border/60 hover:border-primary/20 hover:shadow-md transition-all"
                      >
                        {logo && (
                          <img src={logo.img} alt={logo.alt} className="h-12 w-auto object-contain" loading="lazy" />
                        )}
                        <div>
                          <p className="font-bold text-foreground text-sm mb-2">{acc.name}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{acc.statement}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <p className="text-sm text-muted-foreground mt-8">
                <span className="font-semibold text-foreground">UK Company No.</span> 15168670 — Registered in England and Wales.
              </p>
            </div>

            {/* Trustpilot */}
            <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex text-emerald-600 text-xl">★★★★★</div>
                <div>
                  <p className="text-lg font-bold text-emerald-700">4.6 out of 5</p>
                  <p className="text-sm text-emerald-600">Rated on Trustpilot</p>
                </div>
              </div>
              <p className="text-emerald-900">
                Based on verified student reviews — a reflection of our commitment to quality, care, and genuine support.
              </p>
            </div>

            {/* Why Choose Us */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground">Why Students Choose Universitio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {siteData.whyChooseUs.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start bg-slate-50 rounded-2xl p-6 border border-border/60 hover:border-primary/20 hover:shadow-md transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground mb-2">{item.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Ready to Take the Next Step?</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Let's discuss your university aspirations and create a personalised support plan tailored to your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/free-consultation">
                  <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-md hover:shadow-lg transition-all">
                    Book a Free Consultation
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/assessment-form">
                  <Button variant="outline" className="rounded-full px-8 border-primary/30 hover:border-primary/60 transition-all">
                    Take Our Free Assessment
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
