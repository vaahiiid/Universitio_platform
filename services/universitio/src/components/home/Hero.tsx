import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, CheckCircle2, BookOpen } from "lucide-react";

const STATUS_ROWS = [
  { label: "Academic Profile", status: "Strong",  color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "English (IELTS)", status: "Pending",  color: "text-amber-400",   bg: "bg-amber-400/10"  },
  { label: "UCAS Application", status: "Ready",   color: "text-sky-400",     bg: "bg-sky-400/10"    },
];

const FLOAT_CHIPS = [
  { icon: CheckCircle2, label: "UCAS Verified",     top: "6%",  left: "-4%",  delay: 0.2 },
  { icon: BookOpen,     label: "13 Unis Matched",   top: "52%", right: "-2%", delay: 0.9 },
  { icon: Zap,          label: "£3,200 Scholarship",bottom: "8%",left: "8%",  delay: 1.6 },
];

function Node({ cx, cy, r, delay }: { cx: number; cy: number; r: number; delay: number }) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      fill="rgba(66,20,125,0.5)"
      animate={{ opacity: [0.3, 0.9, 0.3], r: [r, r + 1.5, r] }}
      transition={{ duration: 2.8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function AIBrainVisual() {
  return (
    <div className="relative h-full w-full flex items-center justify-center select-none">

      {/* Ambient outer glow */}
      <motion.div
        animate={{ opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[-8%] bg-gradient-to-br from-primary/25 via-secondary/10 to-transparent rounded-[40px] blur-3xl pointer-events-none"
      />

      {/* Floating background nodes (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
        <Node cx={18}  cy={55}  r={3}   delay={0}   />
        <Node cx={82}  cy={22}  r={2.5} delay={0.6} />
        <Node cx={92}  cy={72}  r={3.5} delay={1.2} />
        <Node cx={10}  cy={80}  r={2}   delay={0.9} />
        <Node cx={50}  cy={10}  r={2}   delay={1.8} />
        <motion.line x1="18%" y1="55%" x2="50%" y2="10%" stroke="rgba(66,20,125,0.18)" strokeWidth="1"
          animate={{ opacity: [0.15, 0.4, 0.15] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} />
        <motion.line x1="82%" y1="22%" x2="92%" y2="72%" stroke="rgba(99,44,160,0.15)" strokeWidth="1"
          animate={{ opacity: [0.1, 0.35, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 1.2 }} />
        <motion.line x1="10%" y1="80%" x2="18%" y2="55%" stroke="rgba(66,20,125,0.15)" strokeWidth="1"
          animate={{ opacity: [0.12, 0.3, 0.12] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.3 }} />
      </svg>

      {/* Floating chips */}
      {FLOAT_CHIPS.map(({ icon: Icon, label, delay, ...pos }) => (
        <motion.div
          key={label}
          style={{ position: "absolute", ...pos } as React.CSSProperties}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -5, 0] }}
          transition={{ opacity: { delay, duration: 0.5 }, y: { duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay } }}
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-white/60 shadow-lg shadow-primary/10 px-3 py-1.5 rounded-full text-[11px] font-semibold text-foreground z-30 whitespace-nowrap"
        >
          <Icon className="w-3 h-3 text-primary" />
          {label}
        </motion.div>
      ))}

      {/* Main card — gently floating */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-20 w-full max-w-[94%] rounded-3xl overflow-hidden"
        style={{ boxShadow: "0 0 70px rgba(66,20,125,0.32), 0 20px 60px rgba(0,0,0,0.35)" }}
      >
        {/* Card dark background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0e0522] via-[#140936] to-[#0b1648]" />

        {/* Breathing aurora inside card */}
        <motion.div
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/3 -right-1/4 w-3/4 h-3/4 bg-primary/35 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.42, 0.2] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-1/3 -left-1/4 w-2/3 h-2/3 bg-secondary/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Header */}
        <div className="relative z-10 flex items-center gap-3 px-5 py-4 border-b border-white/8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/40">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">AskiMate AI</p>
            <p className="text-[11px] text-white/45 mt-0.5">Decision Engine · v2.4</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <motion.span
              animate={{ opacity: [1, 0.35, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <span className="text-[11px] font-semibold text-emerald-400">Active</span>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 p-4 space-y-3">

          {/* User query bubble */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="flex justify-end"
          >
            <div
              className="max-w-[75%] text-white text-[11.5px] px-4 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed"
              style={{ background: "linear-gradient(135deg, #42147d, #6b21a8)", boxShadow: "0 4px 20px rgba(66,20,125,0.5)" }}
            >
              Assess my profile for Imperial College MSc Computer Science.
            </div>
          </motion.div>

          {/* AI response card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="bg-white/6 border border-white/10 rounded-2xl rounded-tl-sm p-4 space-y-3 backdrop-blur-sm"
          >
            {/* Score + ring */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Admission Likelihood</p>
                <p className="text-[26px] font-extrabold text-white mt-0.5 leading-none">
                  82%{" "}
                  <span className="text-emerald-400 text-sm font-semibold align-middle">Strong</span>
                </p>
              </div>
              <svg width="52" height="52" viewBox="0 0 52 52" className="shrink-0" aria-hidden="true">
                <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4.5" />
                <motion.circle
                  cx="26" cy="26" r="21"
                  fill="none"
                  stroke="url(#heroRing)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={String(2 * Math.PI * 21)}
                  initial={{ strokeDashoffset: 2 * Math.PI * 21 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 21 * (1 - 0.82) }}
                  transition={{ duration: 1.3, delay: 0.9, ease: "easeOut" }}
                  transform="rotate(-90 26 26)"
                />
                <defs>
                  <linearGradient id="heroRing" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Status rows */}
            <div className="space-y-1.5">
              {STATUS_ROWS.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 1.0 + i * 0.14 }}
                  className="flex items-center justify-between text-[11px]"
                >
                  <span className="text-white/55">{row.label}</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${row.color} ${row.bg}`}>
                    {row.status}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Divider + next step */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
              className="pt-2 border-t border-white/8 flex items-start gap-2 text-[10.5px] text-white/45 leading-relaxed"
            >
              <Zap className="w-3.5 h-3.5 text-secondary mt-0.5 shrink-0" />
              <span>Next step: Submit IELTS score to unlock your full application review.</span>
            </motion.div>
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
            <AIBrainVisual />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
