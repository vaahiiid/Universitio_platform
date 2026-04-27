import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageCircle, BarChart3, Globe, FileWarning, Users, ArrowRight, Sparkles } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    color: "bg-violet-100 text-primary",
    title: "Ask Study Abroad Questions",
    desc: "Get instant, accurate answers about universities, courses, entry requirements, and deadlines — any time of day.",
  },
  {
    icon: BarChart3,
    color: "bg-blue-100 text-blue-600",
    title: "Check Your Admission Chances",
    desc: "Upload your grades and profile. AskiMate analyses your chances and highlights your strongest options.",
  },
  {
    icon: Globe,
    color: "bg-emerald-100 text-emerald-600",
    title: "Compare Countries and Courses",
    desc: "UK vs Canada vs Germany — instantly compare study destinations, tuition costs, and living expenses side by side.",
  },
  {
    icon: FileWarning,
    color: "bg-amber-100 text-amber-600",
    title: "Understand Visa and Risks",
    desc: "Navigate UK Student visa requirements, financial proofs, and timelines with clear, step-by-step guidance.",
  },
  {
    icon: Users,
    color: "bg-rose-100 text-rose-600",
    title: "Get Mentor Support",
    desc: "Every complex answer is reviewed by ICEF-accredited mentors. AI speed, human expertise — together.",
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
            What AskiMate AI Can Help You With
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Everything you need to plan, apply, and succeed — powered by AI and backed by real admissions experts.
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
                className={`relative group bg-slate-50 hover:bg-white border border-border/60 hover:border-primary/30 hover:shadow-lg rounded-2xl p-6 transition-all duration-300 ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{f.title}</h3>
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
              className="rounded-full bg-primary hover:bg-primary/90 text-white px-10 h-13 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 group"
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
