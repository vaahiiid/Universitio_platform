import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
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
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              ABOUT US
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Your Trusted Gateway to Global Education
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Since 2022, Universitio has helped hundreds of students achieve their university dreams. We combine genuine expertise, personal care, and proven results.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

            {/* Who We Are */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Who We Are</h2>
                  <div className="w-12 h-1 bg-primary rounded-full mb-6"></div>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Universitio is a UK-registered education consultancy dedicated to helping students from around the world access trusted universities abroad. We specialise in making the application process simple, personal, and stress-free.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Our agency owner has completed the British Council Agent & Counsellor Training programme, bringing professional expertise and a deep understanding of international education standards. We are accredited by ICEF (International Consultants for Education and Fairs) and members of the Greater Birmingham Chambers of Commerce.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We are also registered with the Information Commissioner's Office (ICO), ensuring that your personal data is handled securely and responsibly in full compliance with UK GDPR.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Expert Guidance</p>
                      <p className="text-xs text-muted-foreground mt-1">Certified education professionals with hands-on experience</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Personalised Support</p>
                      <p className="text-xs text-muted-foreground mt-1">One-to-one guidance tailored to your goals and background</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Global Reach</p>
                      <p className="text-xs text-muted-foreground mt-1">Applications to universities worldwide, especially the UK</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground text-sm">Compliance & Security</p>
                      <p className="text-xs text-muted-foreground mt-1">ICO-registered, GDPR-compliant, fully transparent</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Credentials */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Trusted & Accredited</h2>
                <div className="w-12 h-1 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground text-base mb-10 max-w-2xl">
                Universitio is recognised and accredited by leading UK and international education bodies, ensuring you receive advice that meets the highest professional standards.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {siteData.accreditations
                  .filter(acc => acc.logoKey !== "trustpilot")
                  .map((acc) => {
                    const logo = CRED_LOGOS[acc.logoKey];
                    return (
                      <div
                        key={acc.id}
                        className="flex flex-col gap-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all"
                      >
                        {logo && (
                          <img src={logo.img} alt={logo.alt} className="h-14 w-auto object-contain" loading="lazy" />
                        )}
                        <div>
                          <p className="font-bold text-foreground text-sm mb-2">{acc.name}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{acc.statement}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <p className="text-xs text-muted-foreground mt-10 pt-8 border-t border-border/40">
                <span className="font-semibold text-foreground">UK Company No. 15168670</span> — Registered in England and Wales under the Companies House register.
              </p>
            </div>

            {/* Trustpilot & Reviews */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 md:p-12 border border-emerald-200 shadow-sm">
              <div className="max-w-2xl">
                <div className="flex items-start gap-4 mb-6">
                  <div>
                    <div className="flex text-emerald-600 text-2xl mb-2">★★★★★</div>
                    <p className="text-2xl font-bold text-emerald-700">4.6 out of 5</p>
                    <p className="text-sm text-emerald-600 mt-0.5">Rated on Trustpilot</p>
                  </div>
                </div>
                <p className="text-emerald-900 text-base leading-relaxed">
                  Based on verified student reviews and feedback. Our Trustpilot rating reflects our commitment to quality, genuine care, and delivering results that matter. Every review comes from real students who have experienced our service first-hand.
                </p>
              </div>
            </div>

            {/* Why Students Choose Us */}
            <div>
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Students Choose Universitio</h2>
                <div className="w-12 h-1 bg-primary rounded-full"></div>
              </div>
              <p className="text-muted-foreground text-base mb-10 max-w-2xl">
                We stand out by providing genuine, expert, and deeply personalised support that sets your applications apart.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {siteData.whyChooseUs.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
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

            {/* Company Details & Compliance */}
            <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border border-border/60">
              <h3 className="text-2xl font-bold mb-6 text-foreground">Company Details & Compliance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Registration</p>
                  <p className="text-sm text-foreground font-semibold">Universitio Limited</p>
                  <p className="text-sm text-muted-foreground">Company No. 15168670</p>
                  <p className="text-sm text-muted-foreground">Registered in England and Wales</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Data Protection</p>
                  <p className="text-sm text-foreground font-semibold">ICO Registered</p>
                  <p className="text-sm text-muted-foreground">Full UK GDPR Compliance</p>
                  <p className="text-sm text-muted-foreground">Secure data handling</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Professional Accreditation</p>
                  <p className="text-sm text-foreground font-semibold">ICEF Accredited Agency</p>
                  <p className="text-sm text-muted-foreground">British Council Certified</p>
                  <p className="text-sm text-muted-foreground">IAS-accredited standards</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Business Network</p>
                  <p className="text-sm text-foreground font-semibold">Birmingham Chambers of Commerce</p>
                  <p className="text-sm text-muted-foreground">Member since 2022</p>
                  <p className="text-sm text-muted-foreground">Ethical education partner</p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 text-center border border-primary/20">
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Ready to Start Your Journey?</h3>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-base">
                Let's discuss your university aspirations and create a personalised support plan tailored to your goals. Our team is here to help you every step of the way.
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
