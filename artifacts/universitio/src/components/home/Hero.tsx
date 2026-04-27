import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, Globe, BarChart3, MessageCircle, Shield } from "lucide-react";

function AIVisual() {
  const nodes = [
    { x: 50, y: 50, size: 56, delay: 0 },
    { x: 20, y: 25, size: 36, delay: 0.4 },
    { x: 80, y: 22, size: 30, delay: 0.8 },
    { x: 15, y: 65, size: 28, delay: 1.2 },
    { x: 78, y: 70, size: 32, delay: 0.6 },
    { x: 45, y: 15, size: 22, delay: 1.0 },
    { x: 60, y: 82, size: 24, delay: 1.4 },
  ];

  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
    [1, 3], [2, 5], [4, 6],
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        style={{ overflow: "visible" }}
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(66,20,125,0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(66,20,125,0.5)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0.2)" />
          </linearGradient>
        </defs>

        <circle cx="50" cy="50" r="48" fill="url(#bgGlow)" />

        {edges.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#edgeGrad)"
            strokeWidth="0.4"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.7, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size / 20}
            fill={i === 0 ? "rgba(66,20,125,0.9)" : "rgba(66,20,125,0.2)"}
            stroke={i === 0 ? "rgba(66,20,125,0.4)" : "rgba(66,20,125,0.3)"}
            strokeWidth="0.5"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3 + node.delay, repeat: Infinity, delay: node.delay }}
          />
        ))}
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl shadow-primary/30 mb-6"
        >
          <Sparkles className="w-10 h-10 text-white" strokeWidth={1.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm border border-border/50 rounded-2xl px-4 py-3 shadow-xl text-center"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">AskiMate AI</p>
          <p className="text-sm font-bold text-foreground">Instant guidance, 24/7</p>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-8 left-4 bg-white rounded-2xl shadow-lg border border-border/50 px-3 py-2.5 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div className="text-xs font-semibold text-foreground whitespace-nowrap">AI Analysis</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-8 right-4 bg-white rounded-2xl shadow-lg border border-border/50 px-3 py-2.5 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Globe className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xs font-semibold text-foreground whitespace-nowrap">200+ Countries</div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute bottom-12 left-2 bg-white rounded-2xl shadow-lg border border-border/50 px-3 py-2.5 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BarChart3 className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <div className="text-xs font-bold text-foreground">98%</div>
          <div className="text-[10px] text-muted-foreground whitespace-nowrap">Acceptance rate</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-12 right-2 bg-white rounded-2xl shadow-lg border border-border/50 px-3 py-2.5 flex items-center gap-2"
      >
        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="text-xs font-semibold text-foreground whitespace-nowrap">Ask anything</div>
      </motion.div>

      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.2, 0.12] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute inset-0 rounded-full bg-primary/10 pointer-events-none"
        style={{ margin: "10%" }}
      />
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
              <span>Powered by AskiMate AI</span>
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Meet{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AskiMate AI</span>
              ,{" "}Your Smart Study Abroad Assistant
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Ask questions, check your chances, compare study options, and get personalised guidance powered by AI and supported by real experts.
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
                <p>1,000+ students guided</p>
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
            className="relative h-[480px] w-full hidden lg:block"
          >
            <AIVisual />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
