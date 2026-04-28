import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Bot, User } from "lucide-react";

const QA_PAIRS = [
  {
    question: "What GPA do I need for top UK universities?",
    answer:
      "Most top UK universities like UCL or Edinburgh expect a GPA of 3.5+ or equivalent. With a 3.7 and strong English scores, you'd be highly competitive for engineering and business programs.",
  },
  {
    question: "Can I work part-time on a student visa in Canada?",
    answer:
      "Yes! On a Canadian student visa you can work up to 20 hrs/week during term and full-time during scheduled breaks — no extra work permit needed.",
  },
  {
    question: "How do I boost my NYU admission chances?",
    answer:
      "Strong extracurriculars, a compelling personal statement, and a GPA above 3.5 significantly help. NYU values leadership and community involvement — highlight any impactful roles.",
  },
];

type Phase = "question" | "typing" | "answer";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
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
  const [qaIndex, setQaIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let t3: ReturnType<typeof setTimeout>;

    if (phase === "question") {
      t1 = setTimeout(() => setPhase("typing"), 900);
    } else if (phase === "typing") {
      t2 = setTimeout(() => setPhase("answer"), 2200);
    } else if (phase === "answer") {
      t3 = setTimeout(() => {
        setQaIndex((i) => (i + 1) % QA_PAIRS.length);
        setPhase("question");
      }, 4200);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [phase, qaIndex]);

  const qa = QA_PAIRS[qaIndex];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-primary/15 border border-border/50 overflow-hidden flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-primary to-secondary">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">AskiMate AI</p>
            <p className="text-[10px] text-white/70 leading-none mt-0.5">Online · Study Abroad Assistant</p>
          </div>
          <span className="ml-auto flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        </div>

        <div className="flex flex-col gap-3 px-4 py-4 min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={`q-${qaIndex}`}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.35 }}
              className="flex items-end gap-2 justify-end"
            >
              <div className="max-w-[80%] bg-primary text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 shadow-sm leading-relaxed">
                {qa.question}
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mb-0.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {(phase === "typing" || phase === "answer") && (
              <motion.div
                key={`ai-${qaIndex}`}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.35 }}
                className="flex items-end gap-2"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-0.5">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="max-w-[80%] bg-slate-50 border border-border/50 text-sm rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm leading-relaxed text-foreground">
                  {phase === "typing" ? (
                    <TypingDots />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      {qa.answer}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-4 pb-4">
          <Link
            href="/askimate"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 transition-opacity group"
          >
            <Sparkles className="w-4 h-4" />
            Try it yourself
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="absolute -top-3 -right-3 w-24 h-24 bg-primary/8 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-secondary/10 rounded-full blur-2xl pointer-events-none" />
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
            className="relative h-[480px] w-full hidden lg:flex items-center justify-center"
          >
            <HeroChatDemo />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
