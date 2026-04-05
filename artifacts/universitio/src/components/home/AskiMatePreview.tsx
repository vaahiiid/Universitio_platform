import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, BookOpen, Sparkles, ArrowRight, Shield } from "lucide-react";

export function AskiMatePreview() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-16 md:py-24 relative overflow-hidden border-b border-border/40">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-background to-background" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 90% at 85% 50%, rgba(66,20,125,0.1) 0%, transparent 65%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: Content ── */}
          <div>
            {/* AI label badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AskiMate AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-5 leading-tight">
              AI-powered education<br />guidance, 24/7
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your personal education mentor. Get expert, real-time guidance from AI trained on UK admissions — backed by human mentors who review every answer.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Real Mentors Behind the AI",
                  desc: "Every complex answer is reviewed by Universitio's expert team",
                },
                {
                  icon: BookOpen,
                  title: "Deep UK Admissions Knowledge",
                  desc: "UCAS, visas, scholarships, personal statements — all covered",
                },
                {
                  icon: Zap,
                  title: "Instant, Personalised Answers",
                  desc: "Not generic advice — responses built around your specific profile",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                onClick={() => setLocation("/askimate-signup")}
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-7 shadow-lg hover:shadow-primary/25 hover:-translate-y-px transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try AskiMate Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/askimate")}
                className="rounded-full px-7 border-primary/30 text-primary hover:bg-primary/5"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* ── Right: Chat Mockup ── */}
          <div className="relative">
            {/* Orb glow behind card */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10"
            >
              <div
                className="w-80 h-80 rounded-full animate-pulse-glow"
                style={{
                  background:
                    "radial-gradient(circle, rgba(66,20,125,0.14) 0%, transparent 70%)",
                  filter: "blur(20px)",
                }}
              />
            </div>

            {/* Chat card */}
            <div className="bg-white rounded-2xl shadow-xl border border-border/40 overflow-hidden">
              {/* Header bar */}
              <div className="bg-primary px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">AskiMate AI</p>
                  <p className="text-white/70 text-xs">Your personal education mentor</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/80 text-xs font-medium">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 bg-slate-50/60">
                {/* User question */}
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm max-w-[80%] shadow-sm">
                    What are the requirements for a UK Student Visa?
                  </div>
                </div>

                {/* AI answer */}
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm shadow-sm border border-border/30 max-w-[80%]">
                    <p className="font-medium text-foreground mb-2">For a UK Student Visa, you'll need:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        A Confirmation of Acceptance (CAS)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        English proficiency (IELTS 6.0+)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        Financial evidence (£1,334/month)
                      </li>
                    </ul>
                    <p className="mt-2.5 text-primary font-semibold text-xs">Want me to walk you through each step? →</p>
                  </div>
                </div>
              </div>

              {/* Input area */}
              <div className="px-5 py-4 border-t border-border/40 bg-white">
                <div className="flex items-center gap-2 bg-muted/40 rounded-xl px-4 py-2.5 border border-border/30">
                  <span className="flex-1 text-sm text-muted-foreground">Ask your question…</span>
                  <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 text-primary/60" />
              <span>Answers reviewed by ICEF-accredited mentors</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
