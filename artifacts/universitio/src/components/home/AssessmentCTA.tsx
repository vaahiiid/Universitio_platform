import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AssessmentCTA() {
  return (
    <section id="assessment" className="py-20 bg-gradient-to-br from-slate-900 to-primary text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
          Free Admissions Assessment
        </h2>

        <p className="text-lg text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
          Find out your estimated chances of admission before you apply.
        </p>

        <Link href="/assessment-form">
          <Button
            size="lg"
            className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-10 h-14 text-lg shadow-xl shadow-secondary/30 hover:shadow-secondary/50 hover:-translate-y-0.5 transition-all group"
          >
            Take the Free Assessment
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
