import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { useRef, useEffect, useState } from "react";
import { Footer } from "@/components/layout/Footer";
import { AskiMateNavbar } from "@/components/layout/AskiMateNavbar";
import { Button } from "@/components/ui/button";
import {
  Check,
  MessageSquare,
  BookOpen,
  Zap,
  ArrowRight,
  Users,
  Clock,
  Shield,
  ChevronRight,
  Sparkles,
  Brain,
  RefreshCw,
  UserCheck,
  Globe,
  Building2,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Target,
  Database,
  PoundSterling,
  TrendingUp,
} from "lucide-react";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";
import icefBadge from "@assets/001bG000006Y3MkQAK_badge_1773399029266.webp";
import britishCouncilCert from "@assets/Certification_1773399011626.webp";
import companiesHouse from "@assets/companies-hous_1773399011626.webp";
import icoLogo from "@assets/Ico_1773399011627.webp";

export default function AskiMateLanding() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAskiMateAuth();
  const packagesRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const scrollToPackages = () => {
    const el = document.getElementById("packages");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartChat = () => {
    if (isAuthenticated) {
      setLocation("/askimate-dashboard");
    } else {
      setLocation("/askimate-signup");
    }
  };

  const handleCheckout = async (plan: string) => {
    const token = localStorage.getItem("askimate_token");
    if (!token) {
      setLocation("/askimate-signup");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Helmet>
        <title>AskiMate AI | Your AI Mate for Studying Abroad | Universitio</title>
        <meta
          name="description"
          content="AskiMate is an AI-first guidance system created by Universitio, supporting international students through every stage of studying abroad — with human experts in the loop when review is needed."
        />
        <link rel="canonical" href="https://universitio.com/askimate" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": "https://universitio.com/askimate",
          "name": "AskiMate AI — Your AI Mate for Studying Abroad",
          "description": "AskiMate is an AI-first guidance system created by Universitio, supporting international students through every stage of studying abroad.",
          "url": "https://universitio.com/askimate",
          "isPartOf": {
            "@type": "WebSite",
            "@id": "https://universitio.com/#website",
            "name": "Universitio",
            "url": "https://universitio.com"
          }
        })}</script>
      </Helmet>

      <AskiMateNavbar />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(66,20,125,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(66,20,125,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Gradient */}
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 80% 60% at 70% 50%, rgba(66,20,125,0.07) 0%, transparent 70%)" }} />
        {/* Blur orb */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(99,70,220,0.08) 0%, transparent 65%)", filter: "blur(60px)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

            {/* ── LEFT: Copy ── */}
            <div
              className="text-center lg:text-left"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(22px)", transition: "all 0.7s ease" }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 mb-7">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-semibold text-primary tracking-wide">AI-driven · Expert-supervised system</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[3.4rem] font-bold text-foreground leading-[1.12] mb-6 tracking-tight">
                Make the right study abroad decisions —
                <span className="block mt-1" style={{ color: "#42147d" }}>with AI that actually understands your profile</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-10 leading-relaxed">
                AskiMate analyses your profile, evaluates your options, and guides your next steps — combining structured AI reasoning with expert human validation where it matters.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-5">
                <Button
                  onClick={handleStartChat}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-9 h-13 text-base shadow-lg shadow-primary/20 hover:-translate-y-px transition-all"
                >
                  {isAuthenticated && user ? `Continue as ${user.firstName}` : "Get Your Answer"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => { const el = document.getElementById("how-it-works"); if (el) el.scrollIntoView({ behavior: "smooth" }); }}
                  variant="outline"
                  size="lg"
                  className="rounded-full px-8 h-13 text-base border-primary/25 text-primary hover:bg-primary/5"
                >
                  See How It Works
                </Button>
              </div>

              {/* Microcopy */}
              <p className="text-xs text-muted-foreground text-center lg:text-left tracking-wide">
                No generic answers · Structured guidance · Continuous learning system
              </p>

              {/* System signals */}
              <div className="mt-8 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 justify-center lg:justify-start flex-wrap">
                {[
                  { icon: Users, label: "Human-in-the-loop system" },
                  { icon: Database, label: "Continuously improving knowledge base" },
                  { icon: TrendingUp, label: "Answers get better over time" },
                ].map((s) => (
                  <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <s.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: System Flow Diagram ── */}
            <div
              className="relative hidden lg:flex items-center justify-center"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)", transition: "all 0.9s ease 0.18s" }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 rounded-3xl" style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(66,20,125,0.06) 0%, transparent 70%)" }} />

              {/* Flow diagram */}
              <div className="relative w-full max-w-[420px] flex flex-col items-center gap-0 py-2">

                {/* Node 1: User Input */}
                <div className="w-full bg-white border border-border/50 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-primary/20 hover:shadow-md transition-all animate-float-gentle" style={{ animationDelay: "0s" }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-0.5">User Input</p>
                    <p className="text-sm font-semibold text-foreground">Student question + profile context</p>
                  </div>
                </div>

                {/* Connector 1 */}
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-px h-8 bg-border/40" />
                  <div className="w-1 h-1 rounded-full bg-border/60" />
                </div>

                {/* Node 2: AI Analysis */}
                <div className="w-full bg-primary/5 border border-primary/15 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all animate-float-gentle" style={{ animationDelay: "0.4s" }}>
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest mb-0.5">AI Analysis</p>
                    <p className="text-sm font-semibold text-foreground">Structured reasoning · Validated data</p>
                  </div>
                  <span className="text-[10px] font-semibold text-primary bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 whitespace-nowrap">AI decides</span>
                </div>

                {/* Connector 2 */}
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-px h-8 bg-amber-200/80" />
                  <div className="w-1 h-1 rounded-full bg-amber-300" />
                </div>

                {/* Node 3: Confidence Check */}
                <div className="w-full bg-white border border-amber-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-amber-200 hover:shadow-md transition-all animate-float-gentle" style={{ animationDelay: "0.8s" }}>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-widest mb-0.5">Confidence Check</p>
                    <p className="text-sm font-semibold text-foreground">Complex or uncertain? Flags for review</p>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-1 whitespace-nowrap">Escalates if needed</span>
                </div>

                {/* Connector 3 */}
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-px h-8 bg-green-200/80" />
                  <div className="w-1 h-1 rounded-full bg-green-300" />
                </div>

                {/* Node 4: Expert Review */}
                <div className="w-full bg-white border border-green-100 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all animate-float-gentle" style={{ animationDelay: "1.2s" }}>
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-green-600/70 uppercase tracking-widest mb-0.5">Expert Review</p>
                    <p className="text-sm font-semibold text-foreground">Human-in-the-loop — only when needed</p>
                  </div>
                </div>

                {/* Connector 4 */}
                <div className="flex flex-col items-center my-1.5">
                  <div className="w-px h-8 bg-border/40" />
                  <div className="w-1 h-1 rounded-full bg-primary/30" />
                </div>

                {/* Node 5: Final Answer */}
                <div className="w-full bg-white border border-primary/20 rounded-2xl px-5 py-4 shadow-sm flex items-center gap-4 hover:border-primary/35 hover:shadow-md transition-all animate-float-gentle" style={{ animationDelay: "1.6s" }}>
                  <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-widest mb-0.5">Final Answer</p>
                    <p className="text-sm font-semibold text-foreground">Structured, validated guidance</p>
                  </div>
                  <span className="text-[10px] font-semibold text-primary bg-primary/8 border border-primary/15 rounded-full px-2.5 py-1 whitespace-nowrap">Learns over time</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── PROBLEM SECTION ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <AlertTriangle className="w-3.5 h-3.5" />
              THE PROBLEM
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Study abroad guidance is fragmented, biased, and risky.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              Most students piece together advice from agents, forums, social media, friends, and generic AI tools — sources that are often outdated, contradictory, biased, or unsafe. One wrong choice can affect applications, visas, or future plans.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: AlertTriangle, title: "Conflicting advice", desc: "Different agents and websites give contradictory answers — you don't know which to trust." },
              { icon: Clock, title: "Outdated information", desc: "Forum posts and social media rarely reflect current visa rules or admission criteria." },
              { icon: Target, title: "Generic AI gaps", desc: "Generic chatbots aren't trained on your destination, profile, or institution-specific rules." },
              { icon: Shield, title: "Unverified sources", desc: "Many agents work for commission and push the institutions that pay them, not the right fit." },
            ].map((item) => (
              <div key={item.title} className="bg-slate-50 rounded-2xl p-6 border border-border/40">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm md:text-base font-semibold text-foreground">
              Students need <span className="text-primary">one trusted, supervised source</span> — that's why we built AskiMate.
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOW ASKIMATE WORKS ───────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              THE PROCESS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">How AskiMate Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A structured system with human oversight at every stage that matters — not just a chatbot.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Ask your question",
                desc: "From university choices and documents to visa rules, accommodation, and life after arrival.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI gives structured guidance",
                desc: "AskiMate uses student context, verified knowledge, and destination-specific logic to give relevant guidance.",
              },
              {
                step: "03",
                icon: ShieldCheck,
                title: "Confidence is checked",
                desc: "If the question is complex or uncertain, the system flags it instead of guessing.",
              },
              {
                step: "04",
                icon: UserCheck,
                title: "Human experts supervise",
                desc: "A Universitio expert can review, improve, or take over when needed — keeping guidance accurate and accountable.",
              },
              {
                step: "05",
                icon: RefreshCw,
                title: "The knowledge base improves",
                desc: "Approved expert answers are added to the verified knowledge base so future students get stronger answers faster.",
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl p-6 border border-border/60 hover:border-primary/30 hover:shadow-md transition-all flex gap-5 items-center"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(16px)",
                  transition: `all 0.6s ease ${0.1 + idx * 0.06}s`,
                }}
              >
                <div className="shrink-0 flex items-center gap-4">
                  <span className="text-3xl font-black text-primary/15 tracking-tight">{item.step}</span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY ASKIMATE IS DIFFERENT ────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why AskiMate Is Different
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built from real advisory experience — not trained on generic internet data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: UserCheck, title: "Human-Supervised AI", desc: "Expert mentors can review and support complex cases — not just automated answers." },
              { icon: Sparkles, title: "Personalised to Your Profile", desc: "Adapts to your background, goals, budget, academic history, and destination." },
              { icon: Building2, title: "Institution-Specific Intelligence", desc: "Built with course, country, and university-level rules — not generic info." },
              { icon: Globe, title: "Full Journey Support", desc: "Course choice, applications, visa, travel, accommodation, and settling in." },
              { icon: BookOpen, title: "Built on Verified Knowledge", desc: "Answers come from structured, expert-reviewed information — not random web pages." },
              { icon: Shield, title: "Conflict-Free Guidance", desc: "Recommendations based on what's right for you — not commission from institutions." },
              { icon: PoundSterling, title: "Fraction of Agent Cost", desc: "Premium guidance from £12/month versus thousands paid to traditional agents." },
              { icon: Database, title: "Continuously Learning", desc: "The knowledge base grows with every approved expert answer, getting stronger over time." },
            ].map((item) => (
              <div
                key={item.title}
                className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BUILT BY UNIVERSITIO ─────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/6 to-primary/3 rounded-3xl p-10 md:p-14 border border-primary/15">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
                  <Building2 className="w-3.5 h-3.5" />
                  THE COMPANY BEHIND ASKIMATE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-5 leading-tight">
                  Built by Universitio
                </h2>
                <p className="text-muted-foreground text-base leading-relaxed mb-8">
                  AskiMate is a technology product created by Universitio, a UK-based international education company with real experience supporting students through global applications. Universitio combines education expertise, student support experience, and trusted accreditation with AI technology to make guidance more accessible, supervised, and accountable.
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center gap-2"
                  onClick={() => setLocation("/about")}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-border/50 flex flex-col items-center gap-3 shadow-sm">
                  <img src={icefBadge} alt="ICEF Accredited" className="h-12 w-auto object-contain" loading="lazy" />
                  <p className="text-xs font-semibold text-foreground text-center">ICEF Accredited</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-border/50 flex flex-col items-center gap-3 shadow-sm">
                  <img src={britishCouncilCert} alt="British Council Certified" className="h-12 w-auto object-contain" loading="lazy" />
                  <p className="text-xs font-semibold text-foreground text-center">British Council Certified</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-border/50 flex flex-col items-center gap-3 shadow-sm">
                  <img src={companiesHouse} alt="UK Registered" className="h-12 w-auto object-contain" loading="lazy" />
                  <p className="text-xs font-semibold text-foreground text-center">UK Registered Company</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-border/50 flex flex-col items-center gap-3 shadow-sm">
                  <img src={icoLogo} alt="ICO Registered" className="h-12 w-auto object-contain" loading="lazy" />
                  <p className="text-xs font-semibold text-foreground text-center">ICO Registered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ──────────────────────────────────────────────────────── */}
      <section id="packages" ref={packagesRef} className="py-20 md:py-28 bg-gradient-to-br from-primary/5 via-background to-background border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <Zap className="w-3.5 h-3.5" />
              PRICING
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple, transparent access to a smarter system
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Choose how deeply you want the system to analyse, guide, and support your decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">

            {/* ── Basic Access ── */}
            <div className="rounded-2xl border border-border/60 bg-white p-8">
              <p className="text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-widest mb-3">Basic Access</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Start for free</h3>
              <p className="text-sm text-muted-foreground mb-6">Get started with structured AI guidance</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">Free</span>
                <span className="text-sm text-muted-foreground ml-2">forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "5 questions per week",
                  "AI-powered structured answers",
                  "Covers study options, visas, and applications",
                  "Learns from your interaction history",
                  "Access to shared knowledge base",
                  "Standard response depth",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setLocation("/askimate-signup")}
                variant="outline"
                className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                size="lg"
              >
                Start Free
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">No credit card required</p>
            </div>

            {/* ── Pro Access ── */}
            <div
              className="rounded-2xl border-2 p-8 relative"
              style={{ background: "linear-gradient(145deg, rgba(66,20,125,0.04) 0%, #fff 55%)", borderColor: "#42147d" }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm tracking-wide">
                  Most effective
                </span>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#42147d" }}>Pro Access</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Full system capability</h3>
              <p className="text-sm text-muted-foreground mb-6">Deeper analysis and smarter guidance</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">£12</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
                <p className="text-xs text-muted-foreground mt-1">Billed monthly · cancel anytime</p>
              </div>

              {/* Core features */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">Core capability</p>
                <ul className="space-y-2.5">
                  {[
                    { icon: Zap, text: "Unlimited questions", strong: true },
                    { icon: Brain, text: "Deeper AI analysis — multi-step reasoning" },
                    { icon: Sparkles, text: "Personalised answers based on your profile and history" },
                    { icon: MessageSquare, text: "Conversation memory — context-aware responses" },
                    { icon: RefreshCw, text: "Continuous system learning from your interactions" },
                    { icon: Clock, text: "Priority response handling" },
                  ].map(({ icon: Icon, text, strong }) => (
                    <li key={text} className="flex items-start gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span className={`text-sm ${strong ? "font-semibold text-foreground" : "text-foreground"}`}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Advanced system features */}
              <div className="border-t border-border/40 pt-5 mb-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70 mb-3">Advanced system capabilities</p>
                <ul className="space-y-3">
                  {[
                    { icon: ShieldCheck, title: "Confidence-based decision engine", desc: "Evaluates answer reliability before responding" },
                    { icon: Target, title: "Smart escalation for complex cases", desc: "Routes edge cases for expert validation automatically" },
                    { icon: UserCheck, title: "Human-in-the-loop validation", desc: "Expert review only when required — not for every query" },
                    { icon: Database, title: "Knowledge base expansion", desc: "Validated answers improve future system performance" },
                    { icon: TrendingUp, title: "Adaptive guidance layer", desc: "System improves recommendations over time" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <li key={title} className="flex items-start gap-3 rounded-xl bg-primary/4 px-3 py-2.5">
                      <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-snug">{title}</p>
                        <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleCheckout("monthly")}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md hover:shadow-primary/25 hover:-translate-y-px transition-all"
                  size="lg"
                >
                  Upgrade to Pro
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">Cancel anytime · No lock-in</p>
              </div>

              <div className="mt-5 pt-5 border-t border-border/40">
                <p className="text-xs text-muted-foreground mb-3 font-medium">Other billing options:</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleCheckout("quarterly")}
                    className="flex items-center justify-between text-sm text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    <span>3 months</span>
                    <span className="font-semibold">£30 <span className="text-xs text-green-600 font-normal">(save £6)</span></span>
                  </button>
                  <button
                    onClick={() => handleCheckout("semi-annual")}
                    className="flex items-center justify-between text-sm text-foreground hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-primary/5"
                  >
                    <span>6 months</span>
                    <span className="font-semibold">£65 <span className="text-xs text-green-600 font-normal">(save £7)</span></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white border-t border-border/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            GET STARTED
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
            Make your next study abroad decision with confidence.
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Start with AskiMate for instant guidance. Get expert support when your case needs human review.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-13 text-base shadow-lg hover:-translate-y-px transition-all"
            >
              {isAuthenticated && user ? "Go to Dashboard" : "Start Chat Free"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={scrollToPackages}
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-13 text-base border-primary/30 text-primary hover:bg-primary/5"
            >
              View Pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Prefer to speak with a consultant?{" "}
            <Link href="/free-consultation" className="text-primary font-semibold hover:underline">
              Book a free consultation
            </Link>
            {" "}or{" "}
            <Link href="/assessment-form" className="text-primary font-semibold hover:underline">
              check your admission chances
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
