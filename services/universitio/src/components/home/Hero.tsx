import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Send, Shield, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/api";

const DEMO_QAS = [
  {
    question: "What GPA do I need for a UK Master's degree?",
    answer:
      "Most UK universities require a 2:1 equivalent (roughly 3.0–3.3 GPA), though top-ranked institutions like Oxford and Imperial typically expect a 3.5+. We factor in your full profile — not just grades.",
  },
  {
    question: "Can I work part-time on a UK Student Visa?",
    answer:
      "Yes! With a UK Student Visa you can work up to 20 hours per week during term time and full-time during official vacations. Make sure your CAS letter confirms this entitlement.",
  },
  {
    question: "How much does it cost to study in London?",
    answer:
      "Tuition for international students ranges from £12,000–£38,000/year depending on the university and course. Living costs in London average £1,200–£1,800/month. We help you find the best value options for your budget.",
  },
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60 inline-block"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </span>
  );
}

function HeroChatDemo() {
  const [demoIndex, setDemoIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [cyclingActive, setCyclingActive] = useState(true);

  const [userQuestion, setUserQuestion] = useState("");
  const [liveQuestion, setLiveQuestion] = useState<string | null>(null);
  const [liveAnswer, setLiveAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cyclingActive) return;

    const answerTimer = setTimeout(() => setShowAnswer(true), 900);
    const nextTimer = setTimeout(() => {
      setShowAnswer(false);
      setTimeout(() => {
        setDemoIndex((prev) => (prev + 1) % DEMO_QAS.length);
      }, 400);
    }, 5000);

    return () => {
      clearTimeout(answerTimer);
      clearTimeout(nextTimer);
    };
  }, [demoIndex, cyclingActive]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const q = userQuestion.trim();
      if (!q || loading || rateLimited) return;

      setCyclingActive(false);
      setLiveQuestion(q);
      setLiveAnswer(null);
      setError(null);
      setLoading(true);
      setUserQuestion("");

      try {
        const resp = await fetch(apiUrl("/askimate/hero-ask"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: q }),
        });
        const data = await resp.json() as { answer?: string; error?: string; message?: string };

        if (resp.status === 429) {
          setRateLimited(true);
          setError(data.message ?? "You've used your demo questions. Sign up for the full experience.");
        } else if (!resp.ok) {
          setError(data.error ?? "Something went wrong. Please try again.");
        } else {
          setLiveAnswer(data.answer ?? "");
          setQuestionCount((c) => c + 1);
          setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
        }
      } catch {
        setError("Network error. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [userQuestion, loading, rateLimited],
  );

  const currentQA = DEMO_QAS[demoIndex];
  const hasLiveExchange = liveQuestion !== null;

  return (
    <div className="flex flex-col h-full rounded-2xl border border-border/60 bg-white shadow-xl shadow-primary/10 overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/60 bg-gradient-to-r from-primary/5 to-secondary/5 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">AskiMate AI</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Your study abroad assistant</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {!hasLiveExchange && (
          <AnimatePresence mode="wait">
            <motion.div
              key={demoIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="space-y-2"
            >
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed">
                  {currentQA.question}
                </div>
              </div>

              <AnimatePresence>
                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="max-w-[82%] bg-slate-50 border border-border/60 text-xs text-foreground/90 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed">
                      {currentQA.answer}
                    </div>
                  </motion.div>
                )}
                {!showAnswer && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="bg-slate-50 border border-border/60 px-3 py-2 rounded-2xl rounded-tl-sm">
                      <TypingDots />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        )}

        {hasLiveExchange && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-primary text-white text-xs px-3 py-2 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed">
                {liveQuestion}
              </div>
            </div>

            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" strokeWidth={1.5} />
                </div>
                <div className="bg-slate-50 border border-border/60 px-3 py-2 rounded-2xl rounded-tl-sm">
                  <TypingDots />
                </div>
              </div>
            )}

            {liveAnswer && !loading && (
              <motion.div
                ref={answerRef}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-white" strokeWidth={1.5} />
                  </div>
                  <div className="max-w-[82%] bg-slate-50 border border-border/60 text-xs text-foreground/90 px-3 py-2 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed">
                    {liveAnswer}
                  </div>
                </div>
                {questionCount >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="ml-8"
                  >
                    <Link href="/askimate">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer transition-colors">
                        Continue the conversation in AskiMate
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}

            {error && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-8"
              >
                <div className="text-[11px] text-destructive/80 bg-destructive/5 border border-destructive/20 rounded-xl px-3 py-2 leading-relaxed">
                  {error}
                  {rateLimited && (
                    <span className="block mt-1">
                      <Link href="/askimate">
                        <span className="font-semibold text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer">
                          Sign up for unlimited access →
                        </span>
                      </Link>
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 border-t border-border/60 bg-slate-50/80 flex-shrink-0">
        {rateLimited ? (
          <Link href="/askimate">
            <Button size="sm" className="w-full rounded-full bg-primary hover:bg-primary/90 text-xs h-9 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Get full access on AskiMate
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask your own question…"
              disabled={loading}
              maxLength={500}
              className="flex-1 text-xs bg-white border border-border/60 rounded-full px-3.5 py-2 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!userQuestion.trim() || loading}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white disabled:opacity-40 hover:bg-primary/90 transition-colors flex-shrink-0"
              aria-label="Send question"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </form>
        )}
        <p className="text-[10px] text-muted-foreground/60 text-center mt-1.5">
          Try it free · No sign-up needed
        </p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" aria-label="Introduction" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/40">
      <div className="absolute top-20 right-0 w-[700px] h-[700px] bg-primary/6 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-[-15%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-primary/4 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary/20 px-4 py-1.5 rounded-full text-sm font-medium text-primary mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Built with Universitio Technology</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Meet{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AskiMate AI</span>
              ,{" "}Your Smart Study Abroad Assistant
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Ask complex questions, get structured answers, evaluate your admission chances, and receive guided next steps — all in one AI-powered system designed for international students.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/askimate">
                <Button size="lg" className="w-full sm:w-auto text-base rounded-full bg-primary hover:bg-primary/90 px-8 h-14 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 group">
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try AskiMate AI
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/assessment-form">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full px-8 h-14 bg-white/60 backdrop-blur hover:bg-white border-primary/20 hover:border-primary/40 transition-all">
                  Start Smart Assessment
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}&backgroundColor=e2e8f0`} alt="Avatar" width="32" height="32" loading="lazy" decoding="async" className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <p>1,500+ students guided</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary/60" />
                <span>ICEF Accredited · British Council Certified</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[420px] sm:h-[440px] lg:h-[500px] w-full"
          >
            <HeroChatDemo />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
