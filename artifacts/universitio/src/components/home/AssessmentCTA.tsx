import { Link } from "wouter";
import { ArrowRight, Clock, Sparkles, ShieldCheck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const infoCards = [
  { icon: Clock, label: "Takes Under 5 Minutes", desc: "Quick and simple" },
  { icon: Sparkles, label: "Completely Free", desc: "No hidden costs" },
  { icon: ShieldCheck, label: "No Commitment", desc: "Just clarity" },
];

export function AssessmentCTA() {
  return (
    <section id="assessment" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a33] via-primary to-[#2d1157]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-4 py-1.5 rounded-full text-sm font-semibold text-blue-200 mb-8">
              <BarChart3 className="w-4 h-4" />
              Free Admissions Assessment
            </div>

            <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6">
              How Strong Is Your<br />
              <span className="text-secondary">Application?</span>
            </h2>

            <p className="text-lg text-white/65 mb-4 leading-relaxed max-w-lg">
              Find out your estimated chances of admission before you apply. Share your profile and receive a more informed view of your study options.
            </p>
            <p className="text-sm text-white/45 mb-10 max-w-lg">
              Our assessment gives you a smarter starting point — helping you apply to the right courses with confidence.
            </p>

            <Link href="/assessment-form">
              <Button
                size="lg"
                className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-10 h-14 text-lg shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 transition-all group"
              >
                Take the Free Assessment
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {infoCards.map((card, i) => (
              <div
                key={i}
                className="bg-white/[0.07] backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-5 hover:bg-white/[0.12] hover:border-white/20 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0 group-hover:bg-secondary/25 transition-colors">
                  <card.icon className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">{card.label}</h4>
                  <p className="text-white/50 text-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
