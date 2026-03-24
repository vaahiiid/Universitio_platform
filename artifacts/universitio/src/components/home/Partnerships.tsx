import { Link } from "wouter";
import { Check, Users, Gift, Share2, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Partnerships() {
  return (
    <>
      {/* ── Agent / Partner Section — hero card with background image ── */}
      <section id="agents" aria-label="Agent and Partner Programme" className="py-12 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[360px] md:min-h-[420px] flex items-end">
            {/* Background image */}
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80&fit=crop"
              alt="Education professionals collaborating in a meeting"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a0d40] via-[#1a0d40]/70 to-transparent" />

            {/* Text overlay */}
            <div className="relative z-10 w-full p-8 md:p-12">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold mb-4 text-white/90">
                  <Users className="w-4 h-4" />
                  For Agents & Professionals
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight">
                  Partner With Universitio
                </h3>
                <p className="text-white/80 mb-6 text-sm md:text-base max-w-xl leading-relaxed">
                  Are you an education agent, school counsellor, or student mentor? Join our growing network and benefit from a transparent referral structure, dedicated support, and full access to our application resources.
                </p>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 mb-7">
                  {[
                    "Competitive commission",
                    "Dedicated partner support",
                    "Application resources",
                    "Co-branding materials",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-white/85 text-sm font-medium">
                      <div className="w-4 h-4 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-secondary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/partners">
                  <Button
                    size="lg"
                    className="rounded-full bg-white text-primary hover:bg-white/90 font-bold px-8 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                  >
                    Become a Partner
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Student Referral Section ── */}
      <section id="earn" aria-label="Student Referral Programme" className="py-12 md:py-20 bg-gradient-to-br from-primary to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 text-blue-200">
                <Gift className="w-4 h-4" />
                Student Referral Programme
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Earn a Reward by Referring a Student
              </h3>
              <p className="text-lg text-white/80 mb-6 leading-relaxed">
                Know someone planning to study abroad? Refer them — and receive a reward once they successfully enrol.
              </p>
              <p className="text-white/60 mb-8 leading-relaxed text-sm">
                No gimmicks, no vague promises. Your reward is paid only after the referred student successfully enrols through our guidance.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  { icon: Share2, step: "01", text: "Refer a friend or contact considering studying abroad" },
                  { icon: Users, step: "02", text: "They apply with Universitio's expert guidance and support" },
                  { icon: Award, step: "03", text: "Once they successfully enrol, your reward is paid out" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-xs font-bold text-secondary/80 tracking-widest w-6 shrink-0">{item.step}</div>
                    <p className="font-medium text-white/90 flex-1 text-sm">{item.text}</p>
                    <item.icon className="w-4 h-4 text-white/30 shrink-0" />
                  </div>
                ))}
              </div>

              <Link href="/student-referral">
                <Button
                  size="lg"
                  className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8 h-12 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                >
                  Join the Referral Programme
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-xs text-white/35 mt-4">
                Reward paid only after successful enrolment. Full terms provided on sign-up.
              </p>
            </div>

            <div className="hidden lg:flex justify-center relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-[100px]"></div>
              <div className="relative w-full max-w-md aspect-square bg-white/5 rounded-full border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <div className="absolute w-3/4 h-3/4 bg-gradient-to-tr from-secondary/50 to-blue-400/50 rounded-full blur-2xl"></div>
                <Gift className="w-32 h-32 text-white relative z-10 drop-shadow-2xl" strokeWidth={1} />
                <div className="absolute top-10 right-10 bg-white text-primary px-4 py-2 rounded-xl font-bold text-sm shadow-xl rotate-12 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Reward
                </div>
                <div className="absolute bottom-16 left-4 bg-secondary text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl -rotate-6">
                  Refer & Earn
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
