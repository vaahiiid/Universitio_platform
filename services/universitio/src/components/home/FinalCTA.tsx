import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CalendarCheck } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-secondary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(255,255,255,0.08),transparent)]" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.05) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Ready to get started?</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Start with AI.{" "}
            <span className="text-white/80">Finish with expert support.</span>
          </h2>

          <p className="text-lg text-white/75 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let AskiMate guide your first steps — then our accredited advisors take you all the way to your offer letter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/askimate">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 text-base font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 group"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try AskiMate AI
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/free-consultation">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto rounded-full px-10 h-14 text-base border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all group"
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                Book a Free Consultation
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-white/50 text-sm">
            Free to use · No commitment · ICEF Accredited advisors
          </p>
        </motion.div>
      </div>
    </section>
  );
}
