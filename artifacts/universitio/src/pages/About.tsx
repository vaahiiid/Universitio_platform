import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Brain,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  RefreshCw,
  Globe,
  FileText,
  Plane,
  Home,
  HeartHandshake,
  BadgeCheck,
  Lock,
  Building2,
  MessageSquare,
  Scale,
} from "lucide-react";
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

const journeySteps = [
  {
    step: "01",
    icon: Globe,
    title: "Research & shortlisting",
    description:
      "We help students identify the right countries, institutions, and programmes based on their academic profile, career goals, and personal circumstances — not a generic ranked list.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Application preparation",
    description:
      "From personal statements to reference letters and supporting documents, we guide students through every element of a strong application with structured feedback at each stage.",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Visa guidance",
    description:
      "Once an offer is secured, we walk students through the visa application process — financial requirements, documentation, biometrics, and timelines — with clear, accurate information.",
  },
  {
    step: "04",
    icon: Plane,
    title: "Pre-departure support",
    description:
      "We help students prepare for departure: accommodation considerations, arrival logistics, what to expect in the first weeks, and how to navigate life in a new country.",
  },
  {
    step: "05",
    icon: Home,
    title: "Settling in & beyond",
    description:
      "Our support does not stop at the airport. We stay in contact with students during the early weeks of their journey, ensuring they have someone to turn to if questions arise.",
  },
];

const differentiators = [
  {
    icon: Brain,
    title: "AI that is supervised, not autonomous",
    description:
      "AskiMate AI assists with analysis and structured guidance, but every significant output is reviewed and validated by our advisory team. We built it this way on purpose.",
  },
  {
    icon: Scale,
    title: "No commission-driven recommendations",
    description:
      "We do not receive undisclosed commissions for recommending specific universities. Our guidance is based on what suits the student — not what generates a higher fee.",
  },
  {
    icon: MessageSquare,
    title: "Personalised, not templated",
    description:
      "Students receive guidance based on their specific academic background, nationality, goals, and circumstances. We do not apply the same advice to every case.",
  },
  {
    icon: HeartHandshake,
    title: "End-to-end support, not a one-off service",
    description:
      "We work with students from initial research through to arrival and settling in. The relationship does not end when an offer letter lands in their inbox.",
  },
];

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Universitio — UK International Education Company</title>
        <meta
          name="description"
          content="Universitio is a UK-based international education company that has supported over 1,500 students with their study abroad journey. We are also the creators of AskiMate AI, a structured technology system built to complement expert guidance."
        />
        <link rel="canonical" href="https://universitio.com/about" />
      </Helmet>
      <Navbar />
      <main>

        {/* ── 1. HERO ─────────────────────────────────────────────────── */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-primary/8 via-background to-background border-b border-border/40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(66,20,125,0.08),transparent)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              ABOUT UNIVERSITIO
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
              Education first.<br className="hidden md:block" /> Technology built on top.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Universitio is a UK-based international education company that has helped over 1,500 students navigate the process of studying abroad. We are also the creators of AskiMate AI — a structured technology system built from our advisory experience to make that guidance more accessible, consistent, and reliable.
            </p>
          </div>
        </section>

        {/* ── 2. WHO WE ARE ────────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Who We Are</h2>
                  <div className="w-12 h-1 bg-primary rounded-full mb-6" />
                </div>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Universitio is a UK-based international education company built to support students through complex study abroad decisions. Alongside its advisory work, the company has developed AskiMate AI — a structured, multi-layer technology system designed to provide reliable guidance, evaluate student readiness, and support decision-making with a combination of intelligent processing and expert oversight.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We work with students from across the world — particularly from Nigeria, Pakistan, India, Bangladesh, Ghana, Nepal, and Turkey — helping them apply to universities in the United Kingdom, Europe, and beyond.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Our team is ICEF-accredited and British Council certified. We are registered with the Information Commissioner's Office (ICO) and operate in full compliance with UK GDPR. Every piece of advice we give is backed by genuine expertise and a duty of care to the student.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    icon: BadgeCheck,
                    label: "Established and accredited",
                    detail: "ICEF-accredited and British Council certified. A real company with verifiable credentials and a track record of results.",
                  },
                  {
                    icon: UserCheck,
                    label: "Student-first, always",
                    detail: "Our recommendations are based solely on what is right for the student. We have no undisclosed agreements that influence our advice.",
                  },
                  {
                    icon: Globe,
                    label: "International reach",
                    detail: "We support students from over 20 countries and have experience with the specific challenges each nationality faces during the application process.",
                  },
                  {
                    icon: Lock,
                    label: "ICO-registered, GDPR-compliant",
                    detail: "All personal data is handled securely and responsibly. We are registered with the UK's Information Commissioner's Office.",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex gap-4 items-start bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-5 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm mb-1">{item.label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. WHAT MAKES US DIFFERENT ───────────────────────────────── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-y border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Makes Us Different</h2>
              <div className="w-12 h-1 bg-primary rounded-full mb-6" />
              <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                Plenty of companies offer study abroad guidance. Fewer are honest about how that guidance is produced, who it benefits, and how far it actually goes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {differentiators.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 items-start bg-white rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
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
        </section>

        {/* ── 4. OUR TECHNOLOGY (ASKIMATE AI) ──────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                OUR TECHNOLOGY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">AskiMate AI</h2>
              <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-6" />
              <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
                AskiMate AI is a technology product created by Universitio. It was built to make the depth of knowledge our advisers hold available to more students — in a structured, reliable, and always-accessible format.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: Brain,
                  title: "Structured, not conversational",
                  description:
                    "AskiMate does not generate random answers. It processes student profiles against a curated knowledge base covering university requirements, visa rules, and academic entry criteria — and produces clear, specific guidance.",
                },
                {
                  icon: UserCheck,
                  title: "Human experts in the loop",
                  description:
                    "Every complex or ambiguous case is reviewed by a qualified adviser before a response is finalised. AskiMate improves the speed of guidance; it does not replace the judgement behind it.",
                },
                {
                  icon: RefreshCw,
                  title: "A system that learns over time",
                  description:
                    "As more students use AskiMate and advisers validate outputs, the system's knowledge base is refined. Accuracy and relevance improve continuously based on real outcomes, not assumptions.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-7 border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-3 text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-primary/8 to-primary/4 rounded-2xl p-7 border border-primary/20 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Built from real experience — not theory</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  AskiMate was designed and developed by the same team that has been advising international students since 2022. The knowledge base it draws from reflects real cases, real outcomes, and real mistakes — which is precisely what makes it more useful than a generic AI tool.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. HOW WE SUPPORT STUDENTS ───────────────────────────────── */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <HeartHandshake className="w-3.5 h-3.5" />
                THE STUDENT JOURNEY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                How we support students
              </h2>
              <p className="text-white/80 text-base leading-relaxed max-w-2xl">
                Studying abroad involves more than choosing a university and submitting a form. We support students across the entire journey — from the earliest research stage through to life in a new country.
              </p>
            </div>
            <div className="space-y-4">
              {journeySteps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-6 items-start bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
                >
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-white/50 tracking-widest">{item.step}</span>
                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1.5">{item.title}</h3>
                    <p className="text-sm text-white/75 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 6. TRUST & CREDIBILITY ───────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Trust & Credibility</h2>
              <div className="w-12 h-1 bg-primary rounded-full mb-6" />
              <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                We hold ourselves to a high standard — because the decisions we help students make are genuinely significant. Our accreditations and compliance obligations are not marketing tools; they are the baseline we operate from.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {siteData.accreditations
                .filter((acc) => acc.logoKey !== "trustpilot")
                .map((acc) => {
                  const logo = CRED_LOGOS[acc.logoKey];
                  return (
                    <div
                      key={acc.id}
                      className="flex flex-col gap-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all"
                    >
                      {logo && (
                        <img
                          src={logo.img}
                          alt={logo.alt}
                          className="h-14 w-auto object-contain"
                          loading="lazy"
                        />
                      )}
                      <div>
                        <p className="font-bold text-foreground text-sm mb-2">{acc.name}</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{acc.statement}</p>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 md:p-10 border border-border/60">
              <div className="flex items-center gap-3 mb-8">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Company & Compliance Details</h3>
              </div>
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
          </div>
        </section>

        {/* ── 7. CLOSING CTA ───────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-t border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-10 md:p-16 text-center border border-border/60 shadow-sm">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                GET STARTED
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Ready to take the next step?
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-base leading-relaxed">
                Whether you want to explore your options with AskiMate AI or speak directly with one of our advisers, we are here to help you move forward with clarity and confidence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                  onClick={() => setLocation("/askimate")}
                >
                  <Sparkles className="w-4 h-4" />
                  Try AskiMate AI
                  <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/60 transition-all"
                  onClick={() => setLocation("/free-consultation")}
                >
                  Book a Free Consultation
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
