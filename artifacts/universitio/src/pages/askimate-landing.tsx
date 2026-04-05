import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { useRef } from "react";
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
  Bot,
} from "lucide-react";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

export default function AskiMateLanding() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAskiMateAuth();
  const packagesRef = useRef<HTMLElement>(null);

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
        <title>AskiMate AI — Your Personal Education Mentor | Universitio</title>
        <meta
          name="description"
          content="Get personalised mentoring from real education experts. Ask any question about studying in the UK — university applications, visas, accommodation and more."
        />
        <link rel="canonical" href="https://universitio.com/askimate" />
      </Helmet>

      <AskiMateNavbar />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,rgba(66,20,125,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(66,20,125,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
        {/* Radial gradient wash */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 70% at 60% 50%, rgba(66,20,125,0.09) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── LEFT: Text content ── */}
            <div className="text-center lg:text-left">

              {/* AI badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">AI-powered assistant</span>
              </div>

              {/* Live mentor badge */}
              <div className="flex items-center gap-2 mb-6 justify-center lg:justify-start">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-muted-foreground">Real mentors online now</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6 tracking-tight">
                Expert education guidance,
                <span className="block" style={{ color: "#42147d" }}>
                  whenever you need it
                </span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Ask real questions about UK universities, visa applications, accommodation,
                and more. Our experienced mentors give you clear, honest answers — not generic advice.
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
                  View Packages
                </Button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  5 free questions per week
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  Real human mentors
                </span>
              </div>
            </div>

            {/* ── RIGHT: AI Visual ── */}
            <div className="relative hidden lg:flex items-center justify-center min-h-[500px]">
              {/* Orb layers */}
              <div
                className="absolute w-96 h-96 rounded-full animate-pulse-glow pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(99,70,220,0.22) 0%, rgba(66,20,125,0.12) 45%, transparent 70%)",
                  filter: "blur(24px)",
                }}
              />
              <div
                className="absolute w-56 h-56 rounded-full top-10 right-10 animate-pulse-glow pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)",
                  filter: "blur(18px)",
                  animationDelay: "1.4s",
                }}
              />

              {/* Chat mockup card */}
              <div className="relative z-10 bg-white/96 backdrop-blur-sm rounded-2xl shadow-2xl border border-primary/12 w-[340px] animate-float-slow">
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 rounded-t-2xl bg-gradient-to-r from-primary/6 to-transparent">
                  <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">AskiMate AI</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-muted-foreground">Mentor online</span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                {/* Messages */}
                <div className="px-4 py-4 space-y-3 bg-slate-50/60">
                  <div className="flex justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] shadow-sm">
                      Can I get into UCL with ABB at A-level?
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm max-w-[85%] shadow-sm border border-border/30">
                      Yes — UCL's typical offer for most programmes is AAB–ABB. Strong candidates also apply to Computer Science, Economics, or Engineering. Want me to help with your personal statement?
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[85%] shadow-sm">
                      Yes please! 🎓
                    </div>
                  </div>
                </div>

                {/* Mock input */}
                <div className="px-4 pb-4 pt-3">
                  <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-2.5 border border-border/40">
                    <span className="flex-1 text-sm text-muted-foreground">Ask anything…</span>
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating accent: free questions */}
              <div
                className="absolute top-10 -left-6 z-20 bg-white rounded-xl shadow-lg border border-border/40 px-3.5 py-2.5 flex items-center gap-2 animate-float-gentle"
                style={{ animationDelay: "0.6s" }}
              >
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">5 free questions / week</span>
              </div>

              {/* Floating accent: rating */}
              <div
                className="absolute bottom-12 -right-6 z-20 bg-white rounded-xl shadow-lg border border-border/40 px-3.5 py-2.5 flex items-center gap-2 animate-float"
                style={{ animationDelay: "1.8s" }}
              >
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">4.9 / 5 rating</span>
              </div>

              {/* Floating accent: students */}
              <div
                className="absolute top-1/2 -right-8 z-20 bg-white rounded-xl shadow-lg border border-border/40 px-3.5 py-2.5 flex items-center gap-2 animate-float-gentle"
                style={{ animationDelay: "1.1s" }}
              >
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">1,200+ students</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF BAR ────────────────────────────────────────────── */}
      <div className="border-y border-border/40 bg-muted/20 py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span><strong className="text-foreground">1,200+</strong> students helped</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span><strong className="text-foreground">4.9 / 5</strong> average rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Typically responds in <strong className="text-foreground">&lt; 2 hours</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>ICEF accredited — <strong className="text-foreground">Co. No. 15168670</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              How it works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Getting expert guidance has never been simpler
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Ask your question",
                desc: "Type anything — from UCAS applications to student visa requirements. Nothing is too small or too complex.",
              },
              {
                step: "02",
                icon: Users,
                title: "Mentor reviews it",
                desc: "A real Universitio mentor reads your question and crafts a personalised, accurate response just for you.",
              },
              {
                step: "03",
                icon: Zap,
                title: "Get clear guidance",
                desc: "Receive actionable next steps, not vague advice. Clarify follow-ups at any time in the same conversation.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5 mx-auto">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 text-7xl font-black text-primary/5 -z-0 leading-none select-none">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY ASKIMATE ─────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-muted/20 border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why students choose AskiMate
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Backed by Universitio — a registered UK education consultancy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: "Real expertise",
                desc: "Our mentors have first-hand experience navigating UK education, applications, and visas.",
              },
              {
                icon: MessageSquare,
                title: "Personalised answers",
                desc: "Every response is tailored to your specific situation — not a generic FAQ answer.",
              },
              {
                icon: Clock,
                title: "Fast responses",
                desc: "Most questions are answered within 2 hours during business hours. No long waits.",
              },
              {
                icon: Shield,
                title: "Trusted & regulated",
                desc: "Universitio is a registered UK company (No. 15168670) and ICEF accredited.",
              },
              {
                icon: Zap,
                title: "Start free",
                desc: "5 free questions per week with no credit card required. Upgrade only when you need more.",
              },
              {
                icon: Star,
                title: "Proven results",
                desc: "Over 1,200 students have used AskiMate to successfully navigate their education journey.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 bg-white rounded-2xl border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PACKAGES / PRICING ──────────────────────────────────────────── */}
      <section id="packages" ref={packagesRef} className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground">
              Start free. Upgrade only when you need more support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Basic */}
            <div className="rounded-2xl border border-border/70 bg-white p-8">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Free Plan</p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Basic Mentoring</h3>
              <p className="text-sm text-muted-foreground mb-6">Perfect to get started</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">Free</span>
                <span className="text-sm text-muted-foreground ml-2">forever</span>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "5 questions per week",
                  "Clear, structured guidance",
                  "UCAS & university queries",
                  "Student visa questions",
                  "Accommodation advice",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
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
                Get Started Free
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Premium */}
            <div
              className="rounded-2xl border-2 p-8 relative"
              style={{
                background: "linear-gradient(135deg, rgba(66,20,125,0.04) 0%, #fff 60%)",
                borderColor: "#42147d",
              }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                  Most Popular
                </span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#42147d" }}>
                Premium Plan
              </p>
              <h3 className="text-2xl font-bold text-foreground mb-1">Premium Mentoring</h3>
              <p className="text-sm text-muted-foreground mb-6">For priority support & full access</p>

              <div className="mb-8">
                <span className="text-5xl font-black text-foreground">£12</span>
                <span className="text-sm text-muted-foreground ml-1">/month</span>
                <p className="text-xs text-muted-foreground mt-1">Billed monthly · cancel anytime</p>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  { text: "Unlimited questions", strong: true },
                  { text: "Priority replies — typically within 1 hour", strong: false },
                  { text: "Personal Statement feedback", strong: false },
                  { text: "CV & cover letter review", strong: false },
                  { text: "Application form guidance", strong: false },
                  { text: "Ongoing support throughout your journey", strong: false },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <Check className="w-4.5 h-4.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className={`text-sm ${item.strong ? "font-semibold text-foreground" : "text-foreground"}`}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2">
                <Button
                  onClick={() => handleCheckout("monthly")}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md hover:shadow-primary/30 hover:-translate-y-px transition-all"
                  size="lg"
                >
                  Get Premium — £12/month
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-xs text-center text-muted-foreground">Secure checkout via Stripe</p>
              </div>

              {/* Other billing options */}
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
      <section className="py-20 md:py-24 border-t border-border/40 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to get expert guidance?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of students who have navigated their UK education journey with confidence.
            Your first 5 questions are completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleStartChat}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-13 text-base shadow-lg"
            >
              {isAuthenticated && user ? "Go to Dashboard" : "Start Free — No Card Needed"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!isAuthenticated && (
              <Button
                onClick={() => setLocation("/askimate-login")}
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-13 text-base border-primary/30 text-primary hover:bg-primary/5"
              >
                Already have an account?
              </Button>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
