import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BarChart3, label: "Estimated admission likelihood based on your profile" },
  { icon: Clock, label: "Takes under 5 minutes to complete" },
  { icon: CheckCircle, label: "No commitment — completely free" },
  { icon: Sparkles, label: "Personalised starting point for your journey" },
];

export function AssessmentCTA() {
  return (
    <section id="assessment" className="py-24 bg-gradient-to-br from-slate-900 to-primary/90 text-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 text-blue-200">
              <Sparkles className="w-4 h-4" />
              Free Admissions Assessment
            </div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
              Unsure of your chances?<br />
              <span className="text-secondary">Find out your estimated<br />admissions potential.</span>
            </h2>

            <p className="text-lg text-white/75 mb-10 leading-relaxed max-w-lg">
              Our free assessment gives you an early indication of your likelihood of receiving an offer — based on your academic background, target institutions, and study goals. It's a smarter starting point for your application journey.
            </p>

            <ul className="space-y-4 mb-10">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <span className="text-white/85 font-medium leading-snug">{f.label}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/assessment-form">
                <Button
                  size="lg"
                  className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8 h-14 text-base shadow-xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 transition-all group"
                >
                  Take the Free Assessment
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/free-consultation">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 h-14 text-base border-white/30 bg-white/5 hover:bg-white/10 text-white hover:text-white hover:border-white/60 transition-all"
                >
                  Book a Consultation Instead
                </Button>
              </Link>
            </div>

            <p className="text-xs text-white/40 mt-5">
              No account needed. Your data is handled in accordance with UK GDPR and our Privacy Policy.
            </p>
          </motion.div>

          {/* Right: Visual card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="hidden lg:block"
          >
            <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Mock assessment card */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-secondary/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">Your Assessment Result</p>
                  <p className="text-white font-bold text-lg">Admissions Potential</p>
                </div>
              </div>

              {/* Gauge */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-white/60 text-sm">Your estimated likelihood</span>
                  <span className="text-3xl font-bold text-secondary">78%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div className="bg-gradient-to-r from-secondary to-blue-400 h-3 rounded-full" style={{ width: "78%" }}></div>
                </div>
                <div className="flex justify-between text-xs text-white/40 mt-2">
                  <span>Lower chance</span>
                  <span>Strong candidate</span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-4">
                {[
                  { label: "Academic Background", score: 85, colour: "bg-green-400" },
                  { label: "Target Institution Fit", score: 72, colour: "bg-secondary" },
                  { label: "Course Match", score: 80, colour: "bg-blue-400" },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/70">{item.label}</span>
                      <span className="text-white font-semibold">{item.score}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div className={`${item.colour} h-1.5 rounded-full`} style={{ width: `${item.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 text-center">
                  Indicative only — results are estimates to help guide your journey.
                </p>
              </div>

              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-secondary rounded-full shadow-lg shadow-secondary/50"></div>
              <div className="absolute -bottom-3 -left-3 w-5 h-5 bg-blue-400/60 rounded-full"></div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
