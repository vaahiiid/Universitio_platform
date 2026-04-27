import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ArrowRight, UserCheck, MessageSquare, Clock } from "lucide-react";

const pillars = [
  { icon: UserCheck, label: "ICEF-accredited advisors" },
  { icon: MessageSquare, label: "Personalised to your profile" },
  { icon: Clock, label: "Same-day response" },
];

export function ConsultationCTA() {
  return (
    <section className="py-14 md:py-20 bg-slate-50 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left: content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Human Support</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
              Need Expert Help?<br />Speak to a Real Advisor
            </h2>
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              AI gives you direction — our experts help you execute. Whether it's a complex visa situation, a difficult personal statement, or an offer you need to negotiate, our advisors are ready to step in.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              {pillars.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div key={i} className="flex items-center gap-2 bg-white border border-border/60 rounded-xl px-4 py-2.5">
                    <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                  </div>
                );
              })}
            </div>

            <Link href="/free-consultation">
              <Button
                size="lg"
                className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-13 shadow-lg shadow-primary/20 hover:shadow-xl transition-all hover:-translate-y-0.5 group"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Book a Free Consultation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-3">No commitment. Completely free.</p>
          </motion.div>

          {/* Right: visual card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-white rounded-3xl border border-border/60 shadow-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

              {/* Advisor avatars */}
              <div className="flex -space-x-3 mb-5">
                {[21, 22, 23, 24].map((seed) => (
                  <div key={seed} className="w-12 h-12 rounded-full border-3 border-white shadow-md bg-slate-100 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4`}
                      alt="Advisor"
                      width="48"
                      height="48"
                      className="w-full h-full"
                    />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-3 border-white shadow-md bg-primary flex items-center justify-center">
                  <span className="text-white text-xs font-bold">+8</span>
                </div>
              </div>

              <p className="text-sm font-semibold text-foreground mb-1">Our advisory team</p>
              <p className="text-sm text-muted-foreground mb-6">ICEF-accredited education consultants based in the UK.</p>

              <div className="space-y-3">
                {[
                  "University shortlisting for your profile",
                  "Personal statement guidance",
                  "Visa & financial evidence review",
                  "Interview preparation & offer negotiation",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-muted-foreground">Advisors available now</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
