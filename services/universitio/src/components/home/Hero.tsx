import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown, Sparkles, Shield, Brain, BookOpen, Users } from "lucide-react";
import { apiFetch } from "@/lib/api";

function trackHeroCtr(): void {
  apiFetch("/askimate/hero-ctr", { method: "POST" }).catch(() => {});
}

const QA_PAIRS = [
  {
    question: "Can I work part-time on a UK Student visa?",
    answer:
      "Yes. Most international students can work up to 20 hours per week during term time, but your visa conditions and CAS letter must always be checked.",
  },
  {
    question: "What documents do I need for a UK university application?",
    answer:
      "Usually: academic transcripts, English evidence, passport, personal statement, CV if required, and references. Some courses may ask for a portfolio or interview.",
  },
  {
    question: "Can I bring dependants for a master's degree?",
    answer:
      "In the UK, dependants are generally limited to PhD and research-based postgraduate routes. Most taught master's courses do not qualify.",
  },
  {
    question: "Which course is better for my background?",
    answer:
      "Share your academic history, target country, budget, and goals. I can help compare suitable options and explain the risks before you apply.",
  },
];

const TAGS = [
  { icon: Users,    label: "Human-supervised" },
  { icon: Brain,    label: "Knowledge base"    },
  { icon: BookOpen, label: "Student questions" },
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/50 inline-block"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}

/* Pulsing SVG node */
function Node({ x, y, r, delay }: { x: string; y: string; r: number; delay: number }) {
  return (
    <motion.circle
      cx={x} cy={y} r={r}
      fill="rgba(139,92,246,0.45)"
      animate={{ opacity: [0.25, 0.8, 0.25], r: [r, r + 1.4, r] }}
      transition={{ duration: 2.6 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

/* The animated chat card */
function AskiMateChatDemo() {
  const [index, setIndex]       = useState(0);
  const [phase, setPhase]       = useState<"question" | "typing" | "answer" | "hold">("question");

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === "question") {
      t = setTimeout(() => setPhase("typing"), 900);
    } else if (phase === "typing") {
      t = setTimeout(() => setPhase("answer"), 1300);
    } else if (phase === "answer") {
      t = setTimeout(() => setPhase("hold"), 200);
    } else {
      // hold — wait then advance
      t = setTimeout(() => {
        setPhase("question");
        setIndex((prev) => (prev + 1) % QA_PAIRS.length);
      }, 3800);
    }
    return () => clearTimeout(t);
  }, [phase, index]);

  const qa = QA_PAIRS[index];

  return (
    <div className="relative h-full w-full flex items-center justify-center select-none">

      {/* Ambient outer glow */}
      <motion.div
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-6%] bg-gradient-to-br from-primary/30 via-secondary/10 to-transparent rounded-[44px] blur-3xl pointer-events-none"
      />

      {/* SVG node network */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <Node x="12%"  y="18%" r={3}   delay={0}   />
        <Node x="88%"  y="25%" r={2.5} delay={0.7} />
        <Node x="93%"  y="68%" r={3}   delay={1.4} />
        <Node x="8%"   y="78%" r={2.5} delay={1.0} />
        <Node x="50%"  y="7%"  r={2}   delay={1.9} />
        <motion.line x1="12%" y1="18%" x2="50%" y2="7%"   stroke="rgba(139,92,246,0.18)" strokeWidth="1" animate={{ opacity:[0.12,0.38,0.12] }} transition={{ duration:4,   repeat:Infinity, delay:0.4 }} />
        <motion.line x1="88%" y1="25%" x2="93%" y2="68%"  stroke="rgba(139,92,246,0.14)" strokeWidth="1" animate={{ opacity:[0.10,0.30,0.10] }} transition={{ duration:5,   repeat:Infinity, delay:1.1 }} />
        <motion.line x1="8%"  y1="78%" x2="12%" y2="18%"  stroke="rgba(139,92,246,0.15)" strokeWidth="1" animate={{ opacity:[0.10,0.32,0.10] }} transition={{ duration:3.8, repeat:Infinity, delay:0.2 }} />
      </svg>

      {/* Main card */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-[92%] rounded-3xl overflow-hidden border border-primary/15"
        style={{ boxShadow: "0 0 45px rgba(66,20,125,0.18), 0 16px 40px rgba(66,20,125,0.10), 0 4px 20px rgba(0,0,0,0.06)" }}
      >
        {/* Light card background */}
        <div className="absolute inset-0 bg-white" />

        {/* Header — purple gradient matching real AskiMate */}
        <div className="relative z-10 px-5 py-4 border-b border-primary/15 bg-gradient-to-r from-primary via-[#5b189c] to-secondary">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">AskiMate AI</p>
              <p className="text-[11px] text-white/70 mt-0.5">AI study abroad assistant</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[10px] text-white/60 leading-tight">Learning from</p>
              <p className="text-[10px] text-white/90 font-semibold leading-tight">verified guidance</p>
            </div>
          </div>

          {/* Tag chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {TAGS.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-white/80 bg-white/15 border border-white/25 px-2.5 py-0.5 rounded-full"
              >
                <Icon className="w-3 h-3" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="relative z-10 px-4 py-4 space-y-3 min-h-[220px] flex flex-col justify-end bg-slate-50/60">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-3"
            >
              {/* Student question */}
              <div className="flex justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className="max-w-[78%] bg-primary text-white text-[11.5px] px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed shadow-sm shadow-primary/25"
                >
                  {qa.question}
                </motion.div>
              </div>

              {/* AI avatar row */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-primary/30">
                  <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={1.5} />
                </div>

                {/* Typing dots */}
                {(phase === "typing") && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-tl-sm"
                  >
                    <TypingDots />
                  </motion.div>
                )}

                {/* Answer */}
                {(phase === "answer" || phase === "hold") && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="max-w-[82%] bg-white border border-slate-200 text-[11.5px] text-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed"
                  >
                    {qa.answer}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer strip */}
        <div className="relative z-10 px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] text-slate-400">Powered by Universitio knowledge base</p>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-medium text-primary">AI processing</span>
          </motion.div>
        </div>
      </motion.div>
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

          {/* Left column — unchanged */}
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
              <Link href="/askimate" onClick={trackHeroCtr}>
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

            {/* Mobile-only: scroll prompt to AI visual */}
            <button
              onClick={() => {
                document.getElementById("hero-ai-visual")?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              className="lg:hidden mt-2 flex items-center gap-1.5 text-sm font-medium text-primary/70 hover:text-primary transition-colors group self-center"
              aria-label="See how the AI works"
            >
              <motion.span
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-1.5"
              >
                <ArrowDown className="w-4 h-4" />
                See how it works
              </motion.span>
            </button>

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

          {/* Right column — animated chat visual */}
          <motion.div
            id="hero-ai-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative h-[420px] sm:h-[440px] lg:h-[500px] w-full"
          >
            <AskiMateChatDemo />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
