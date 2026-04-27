import { Link } from "wouter";
import { Check, Users, Gift, Share2, Award, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Partnerships() {
  return (
    <section id="agents" aria-label="Partner and Referral Programmes" className="py-12 md:py-20 bg-white border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Work with us</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Grow Together with Universitio</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Partner with Universitio */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0d40] to-[#2d1566] p-8 md:p-10 flex flex-col justify-between min-h-[420px]">
            {/* Decorative orb */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/30 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-sm font-semibold mb-5 text-white/90">
                <Building2 className="w-4 h-4" />
                For Agents &amp; Professionals
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                Partner with Universitio
              </h3>
              <p className="text-white/75 mb-6 text-sm leading-relaxed max-w-sm">
                For education agents, school counsellors, and student mentors. Join our network and benefit from a transparent referral structure and full application resources.
              </p>

              <ul className="space-y-2 mb-8">
                {[
                  "Competitive commission structure",
                  "Dedicated partner support",
                  "Co-branding materials",
                  "Access to application resources",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/85 text-sm">
                    <div className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/partners">
              <Button
                className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-7 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group w-full sm:w-auto"
              >
                Become a Partner
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Right: Earn as a Student */}
          <div id="earn" className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 p-8 md:p-10 flex flex-col justify-between min-h-[420px]">
            {/* Decorative orb */}
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-secondary/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-sm font-semibold mb-5 text-blue-200">
                <Gift className="w-4 h-4" />
                Student Referral Programme
              </div>

              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                Earn as a Student
              </h3>
              <p className="text-white/75 mb-6 text-sm leading-relaxed max-w-sm">
                Know someone planning to study abroad? Refer them and earn a reward once they successfully enrol. No gimmicks — paid after confirmed enrolment.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Share2, step: "01", text: "Refer a friend considering studying abroad" },
                  { icon: Users, step: "02", text: "They apply with Universitio's guidance" },
                  { icon: Award, step: "03", text: "You earn a reward after enrolment" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 px-5 py-3 rounded-xl border border-white/10">
                    <span className="text-xs font-bold text-secondary/80 tracking-widest w-5 flex-shrink-0">{item.step}</span>
                    <p className="font-medium text-white/85 text-sm flex-1">{item.text}</p>
                    <item.icon className="w-4 h-4 text-white/30 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <Link href="/student-referral">
              <Button
                className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-7 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group w-full sm:w-auto"
              >
                Join the Referral Programme
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
