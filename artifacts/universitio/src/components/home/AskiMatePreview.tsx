import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, BarChart3, Users, AlertTriangle, Brain, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    color: "bg-violet-100 text-primary",
    accentColor: "border-primary/20",
    title: "Get Real Answers, Not Generic Advice",
    desc: "Ask complex questions about universities, visas, and applications — get structured, accurate responses instantly.",
  },
  {
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
    accentColor: "border-blue-200/60",
    title: "Check Your Admission Chances",
    desc: "Receive a real-time admission score based on your academic profile, English level, and study plans.",
  },
  {
    icon: Users,
    color: "bg-emerald-100 text-emerald-600",
    accentColor: "border-emerald-200/60",
    title: "AI + Human Mentors",
    desc: "When needed, expert mentors step in to guide you — combining AI speed with real experience.",
  },
  {
    icon: AlertTriangle,
    color: "bg-amber-100 text-amber-600",
    accentColor: "border-amber-200/60",
    title: "Understand Risks Before You Apply",
    desc: "Identify weak points in your profile before applying and avoid costly mistakes.",
  },
  {
    icon: Brain,
    color: "bg-rose-100 text-rose-600",
    accentColor: "border-rose-200/60",
    title: "Continuously Improving Intelligence",
    desc: "AskiMate learns from expert-reviewed answers and builds a verified knowledge base over time.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function AskiMatePreview() {
  return (
    <section className="py-16 md:py-24 bg-white border-b border-border/40" id="askimate-features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">AskiMate AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What AskiMate AI Actually Does
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            A structured AI system designed to guide, evaluate, and support your study abroad journey.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10"
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                className={`relative group bg-slate-50 hover:bg-white border border-border/60 hover:border-primary/25 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base leading-snug">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="text-center">
          <Link href="/askimate">
            <Button
              size="lg"
              className="rounded-full bg-primary hover:bg-primary/90 text-white px-10 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 group"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try AskiMate AI
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}
