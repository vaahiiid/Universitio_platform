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
  Star,
  ArrowRight,
  Users,
  Clock,
  Shield,
  ChevronRight,
  Sparkles,
  FileCheck2,
  GraduationCap,
  Send,
  Brain,
  RefreshCw,
  UserCheck,
  Globe,
  BadgeCheck,
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
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(66,20,125,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(66,20,125,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 70% 70% at 60% 50%, rgba(66,20,125,0.09) 0%, transparent 70%)" }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* LEFT */}
            <div
              className="text-center lg:text-left transition-all duration-700"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(22px)" }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">AI-first · Human-supervised</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6 tracking-tight">
                Your AI Mate for
                <span className="block" style={{ color: "#42147d" }}>Studying Abroad</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Get personalised, supervised guidance for every step of your study abroad journey — from choosing a course to applications, visa, arrival, and beyond.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
                <Button
                  onClick={handleStartChat}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-13 text-base shadow-lg hover:shadow-primary/30 hover:-translate-y-px transition-all"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isAuthenticated && user ? `Continue as ${user.firstName}` : "Start Chat Free"}
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

              <div className="flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" />No credit card required</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" />5 free questions per week</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-green-500" />Human-supervised AI</span>
              </div>
            </div>

            {/* RIGHT: AI Decision Path Visual */}
            <div
              className="relative hidden lg:flex items-center justify-center min-h-[520px]"
              style={{ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)", transition: "all 0.9s ease 0.15s" }}
            >
              <div className="absolute w-96 h-96 rounded-full pointer-events-none animate-pulse-glow"
                style={{ background: "radial-gradient(circle, rgba(99,70,220,0.22) 0%, rgba(66,20,125,0.10) 45%, transparent 70%)", filter: "blur(28px)" }} />

              <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[380px]">
                <div className="flex justify-between w-full px-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-primary/15 px-4 py-3 flex items-center gap-2.5 animate-float-gentle" style={{ animationDelay: "0s" }}>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Student asks</p>
                      <p className="text-[10px] text-muted-foreground">Any study question</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border border-primary/15 px-4 py-3 flex items-center gap-2.5 animate-float-gentle" style={{ animationDelay: "0.6s" }}>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">AI guidance</p>
                      <p className="text-[10px] text-muted-foreground">Verified knowledge</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl border border-primary/20 w-full p-5 relative z-20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">AskiMate AI</p>
                      <p className="text-xs text-muted-foreground">Personalised guidance</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-600" />
                      <span className="text-[10px] font-semibold text-green-700">Verified</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex justify-end">
                      <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-3.5 py-2 text-xs max-w-[80%] shadow-sm">
                        What grades do I need for UCL Computer Science?
                      </div>
                    </div>
                    <div className="flex gap-2 items-start">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-slate-50 rounded-2xl rounded-tl-sm px-3.5 py-2 text-xs max-w-[80%] border border-border/30 shadow-sm">
                        UCL CS typically requires A*AA. Your predicted grades suggest a strong chance — want me to check your full profile?
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-3.5 py-2 border border-border/40">
                    <span className="flex-1 text-xs text-muted-foreground">Ask anything about studying abroad…</span>
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between w-full px-4">
                  <div className="bg-white rounded-2xl shadow-lg border border-green-200 px-4 py-3 flex items-center gap-2.5 animate-float-gentle" style={{ animationDelay: "1.2s" }}>
                    <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Expert review</p>
                      <p className="text-[10px] text-muted-foreground">Human in the loop</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border border-primary/15 px-4 py-3 flex items-center gap-2.5 animate-float-gentle" style={{ animationDelay: "1.8s" }}>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">System learns</p>
                      <p className="text-[10px] text-muted-foreground">Knowledge grows</p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 -right-8 z-30 bg-white rounded-xl shadow-lg border border-border/40 px-3.5 py-2.5 flex items-center gap-2 animate-float" style={{ animationDelay: "0.9s" }}>
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">1,500+ students</span>
                </div>
                <div className="absolute bottom-6 -left-10 z-30 bg-white rounded-xl shadow-lg border border-border/40 px-3.5 py-2.5 flex items-center gap-2 animate-float-gentle" style={{ animationDelay: "0.3s" }}>
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">95% success rate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ────────────────────────────────────────────── */}
      <div className="border-y border-border/40 bg-muted/20 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><span><strong className="text-foreground">1,500+</strong> students supported</span></div>
            <div className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-green-600" /><span><strong className="text-foreground">95%</strong> application success rate</span></div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500 fill-amber-400" /><span><strong className="text-foreground">5.0</strong> Trustpilot rating</span></div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /><span>ICEF accredited · <strong className="text-foreground">Co. No. 15168670</strong></span></div>
          </div>
        </div>
      </div>

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

      {/* ─── PRODUCT PROOF ────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-5">
              <TrendingUp className="w-3.5 h-3.5" />
              THE NUMBERS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Proven results, trusted credentials
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Backed by Universitio's track record supporting students worldwide.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { value: "1,500+", label: "Students supported", icon: Users },
              { value: "1,100+", label: "Community members", icon: Users },
              { value: "95%", label: "Application success rate", icon: BadgeCheck },
              { value: "5.0", label: "Trustpilot rating · 19 reviews", icon: Star },
              { value: "£12", label: "From per month", icon: PoundSterling },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-border/50 text-center hover:shadow-md hover:-translate-y-px transition-all">
                <div className="w-9 h-9 rounded-xl bg-primary/10 mx-auto flex items-center justify-center mb-3">
                  <stat.icon className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-black text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground leading-snug">{stat.label}</p>
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
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground">
              Start free. Upgrade only when you need more support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-border/70 bg-white p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Free Plan</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Basic Mentoring</h3>
              <p className="text-sm text-muted-foreground mb-6">Good for early exploration</p>
              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">Free</span>
                <span className="text-sm text-muted-foreground ml-2">forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "5 free questions per week",
                  "AI-guided support",
                  "UCAS & university queries",
                  "Student visa questions",
                  "Accommodation advice",
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
            </div>

            {/* Premium */}
            <div
              className="rounded-2xl border-2 p-8 relative"
              style={{ background: "linear-gradient(135deg, rgba(66,20,125,0.04) 0%, #fff 60%)", borderColor: "#42147d" }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#42147d" }}>Premium Plan</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Premium Mentoring</h3>
              <p className="text-sm text-muted-foreground mb-6">Priority guidance & full access</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">£12</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
                <p className="text-xs text-muted-foreground mt-1">Billed monthly · cancel anytime</p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <FileCheck2 className="w-3 h-3" /> Documents & Visa
                  </p>
                  <ul className="space-y-2">
                    {[
                      { icon: GraduationCap, text: "Full Academic Document Review" },
                      { icon: Shield, text: "UK Visa Document Check & Guidance" },
                      { icon: BookOpen, text: "Personal Statement feedback" },
                      { icon: Check, text: "CV & cover letter review" },
                    ].map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Send className="w-3 h-3" /> Application
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2.5 rounded-lg bg-primary/8 px-2.5 py-1.5 -mx-2.5">
                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 flex-shrink-0">
                        <Send className="w-2.5 h-2.5 text-primary" />
                      </span>
                      <span className="text-sm font-semibold text-primary leading-snug">
                        Free Application Submission
                        <span className="ml-1 text-xs font-normal text-muted-foreground">(University, College &amp; School)</span>
                      </span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="text-sm text-foreground">Application form guidance</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3" /> Support
                  </p>
                  <ul className="space-y-2">
                    {[
                      { icon: Zap, text: "Unlimited questions", strong: true },
                      { icon: UserCheck, text: "Human-supervised support", strong: false },
                      { icon: Clock, text: "Priority replies — typically within 1 hour", strong: false },
                      { icon: Sparkles, text: "AI Personalised Guidance", strong: false },
                      { icon: Users, text: "Ongoing support throughout your journey", strong: false },
                    ].map(({ icon: Icon, text, strong }) => (
                      <li key={text} className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className={`text-sm ${strong ? "font-semibold text-foreground" : "text-foreground"}`}>{text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => handleCheckout("monthly")}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md hover:shadow-primary/30 hover:-translate-y-px transition-all"
                  size="lg"
                >
                  Upgrade to Premium — £12/month
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">Secure checkout via Stripe</p>
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
