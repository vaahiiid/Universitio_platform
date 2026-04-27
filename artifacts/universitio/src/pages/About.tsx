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
  Database,
  UserCheck,
  RefreshCw,
  Layers,
  Cpu,
  BarChart3,
  Lock,
  Building2,
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

const platformSteps = [
  {
    step: "01",
    icon: Database,
    title: "User inputs data & questions",
    description:
      "Students describe their academic background, goals, and target institutions. AskiMate collects structured inputs to establish a complete decision profile.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "AI evaluates the profile",
    description:
      "The system processes the inputs against its knowledge base — institution requirements, visa conditions, academic entry criteria — and generates a calibrated assessment.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Structured output generated",
    description:
      "AskiMate produces clear, actionable outputs: admission readiness scores, risk flags, document checklists, and prioritised next steps — not generic advice.",
  },
  {
    step: "04",
    icon: UserCheck,
    title: "Human mentors intervene when needed",
    description:
      "Complex edge cases, visa appeals, and personal statement reviews are escalated to verified education professionals. AI recommends; humans execute.",
  },
  {
    step: "05",
    icon: RefreshCw,
    title: "Knowledge base improves over time",
    description:
      "Every interaction refines the system. Outcomes are fed back into the platform so future evaluations become more precise, contextually aware, and reliable.",
  },
];

const whyItems = [
  {
    icon: Brain,
    title: "Structured guidance, not generic advice",
    description:
      "AskiMate produces decision-specific outputs based on your exact profile — not templated responses designed for the average student.",
  },
  {
    icon: BarChart3,
    title: "Decision clarity at every stage",
    description:
      "From shortlisting institutions to submitting a visa application, the platform makes each step visible, measurable, and actionable.",
  },
  {
    icon: ShieldCheck,
    title: "Risk reduction through AI analysis",
    description:
      "The system surfaces hidden risks — eligibility gaps, document deficiencies, visa history issues — before they become rejection reasons.",
  },
  {
    icon: Layers,
    title: "AI + expert combination",
    description:
      "Automated evaluation handles speed and scale. Certified advisors handle complexity and judgement. The two work in tandem, not isolation.",
  },
  {
    icon: Sparkles,
    title: "Scalable, always-on support",
    description:
      "AskiMate is available 24/7. Students across multiple time zones get immediate, consistent, and accurate guidance without waiting for office hours.",
  },
  {
    icon: Lock,
    title: "Compliant & secure infrastructure",
    description:
      "All data is processed under UK GDPR, ICO-registered protocols, and industry-standard encryption. Your information is never sold or shared.",
  },
];

export default function About() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Universitio — AI-Powered EdTech Platform</title>
        <meta
          name="description"
          content="Universitio is a product-led EdTech platform that develops and operates proprietary technology solutions, including AskiMate AI — a structured AI system designed to guide, evaluate, and support international students through complex study abroad decisions."
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
              Building Intelligent Pathways<br className="hidden md:block" /> to Global Education
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Universitio is a product-led EdTech platform that develops and operates proprietary technology solutions, including AskiMate AI — a structured AI system designed to guide, evaluate, and support international students through complex study abroad decisions.
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
                  Where conventional consultancies rely on individual advisors and manual processes, Universitio operates a platform. Every student interaction is structured, evaluated, and supported by a system designed for consistency, accuracy, and scale.
                </p>
                <p className="text-muted-foreground text-base leading-relaxed">
                  We are ICEF-accredited, British Council certified, and ICO-registered — operating under verified, regulated infrastructure to ensure every output students receive meets the highest professional and data compliance standards.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    icon: Cpu,
                    label: "Platform, not consultancy",
                    detail: "A scalable system that processes structured inputs and produces calibrated outputs — not ad-hoc advice.",
                  },
                  {
                    icon: Brain,
                    label: "System, not service",
                    detail: "AskiMate operates as decision-support infrastructure, not a help desk. Every output is structured and verifiable.",
                  },
                  {
                    icon: BarChart3,
                    label: "Decision engine, not just guidance",
                    detail: "Students receive admission readiness scores, risk assessments, and prioritised action plans — not opinions.",
                  },
                  {
                    icon: Lock,
                    label: "Regulated & compliant",
                    detail: "ICO-registered, UK GDPR-compliant, ICEF-accredited. Verified at every layer of the platform.",
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

        {/* ── 3. OUR TECHNOLOGY ────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-y border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                CORE TECHNOLOGY
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Technology</h2>
              <div className="w-12 h-1 bg-primary rounded-full mx-auto mb-6" />
              <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">
                AskiMate is not a chatbot. It is a structured AI system built to support high-stakes education decisions with controlled, verifiable outputs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  icon: Brain,
                  title: "Decision-support infrastructure",
                  description:
                    "AskiMate evaluates student profiles against structured knowledge — institution entry requirements, visa frameworks, academic standards — and generates calibrated assessments.",
                },
                {
                  icon: UserCheck,
                  title: "AI + human-in-the-loop",
                  description:
                    "The system flags scenarios that require human judgement. Certified advisors review, validate, and act on complex cases. AI scales; humans quality-control.",
                },
                {
                  icon: RefreshCw,
                  title: "Continuous learning system",
                  description:
                    "Every outcome is fed back into the platform. AskiMate's knowledge base grows over time, improving the accuracy and contextual relevance of every future evaluation.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-2xl p-7 border border-border/60 hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-3 text-base">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-7 border border-border/60 flex flex-col md:flex-row gap-6 items-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-2">Controlled outputs — not random answers</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  AskiMate is designed to produce structured, domain-specific responses grounded in verified education data. Every output is scoped, explainable, and bounded — by design. This is not a general-purpose AI; it is purpose-built decision infrastructure for international education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. HOW THE PLATFORM WORKS ────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How the Platform Works</h2>
              <div className="w-12 h-1 bg-primary rounded-full mb-6" />
              <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                A five-stage loop that runs from first input to continuous improvement — with human oversight built in at every decision point that matters.
              </p>
            </div>

            <div className="space-y-4">
              {platformSteps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-6 items-start bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <span className="text-xs font-bold text-primary/50 tracking-widest">{item.step}</span>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1.5">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. PRODUCT + SERVICES RELATIONSHIP ──────────────────────── */}
        <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-primary/80 text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                  <Layers className="w-3.5 h-3.5" />
                  PLATFORM ARCHITECTURE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                  AI guides decisions.<br />Experts help execute them.
                </h2>
                <p className="text-white/80 text-base leading-relaxed">
                  AskiMate is the core product — the decision layer. Universitio's advisory services are the execution layer. They are designed to work together, not independently.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-white/90" />
                    <h3 className="font-bold text-white text-base">AskiMate AI — Core Product</h3>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    Evaluates profiles, generates admission readiness scores, surfaces risks, and produces prioritised action plans. Operates 24/7 at scale.
                  </p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <UserCheck className="w-5 h-5 text-white/90" />
                    <h3 className="font-bold text-white text-base">Universitio Services — Execution Layer</h3>
                  </div>
                  <p className="text-white/75 text-sm leading-relaxed">
                    Certified advisors review complex cases, finalise applications, handle visa preparation, and intervene where human judgement is required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. TRUST & ACCREDITATION ─────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Regulated, Verified, Compliant</h2>
              <div className="w-12 h-1 bg-primary rounded-full mb-6" />
              <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                Universitio operates under verified accreditation frameworks and regulatory obligations. This is not a trust badge — it is the infrastructure that makes our outputs defensible, professional, and legally compliant.
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

        {/* ── 7. WHY UNIVERSITIO ───────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-y border-border/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Universitio</h2>
              <div className="w-12 h-1 bg-primary rounded-full mb-6" />
              <p className="text-muted-foreground text-base max-w-2xl leading-relaxed">
                Because the standard model — one advisor, one student, one spreadsheet — doesn't scale, doesn't learn, and doesn't eliminate the risk of human error on decisions that affect people's lives.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whyItems.map((item) => (
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

        {/* ── 8. FINAL CTA ─────────────────────────────────────────────── */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-primary/8 to-primary/4 rounded-3xl p-10 md:p-16 text-center border border-primary/20">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
                <Sparkles className="w-3.5 h-3.5" />
                GET STARTED
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                Start with AI.<br className="hidden md:block" /> Move forward with confidence.
              </h2>
              <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-base leading-relaxed">
                Use AskiMate to evaluate your profile, understand your options, and receive a structured plan — then connect with our advisory team to execute it.
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
