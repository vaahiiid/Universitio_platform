import { Link } from "wouter";
import { Check, Users, Gift, Share2, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Partnerships() {
  return (
    <>
      {/* Agent / Partner Section */}
      <section id="agents" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop"
                  alt="Education professionals collaborating"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold mb-6">
                <Users className="w-4 h-4" />
                For Agents & Professionals
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Partner With Universitio
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Join our growing network of education agents, counsellors, and student introducers.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Are you an education agent, school counsellor, or student mentor? We welcome partnerships with trusted professionals who share our commitment to helping international students achieve their university ambitions. As a Universitio partner, you'll benefit from a fair, transparent referral structure and dedicated support.
              </p>

              <ul className="space-y-4 mb-10">
                {[
                  "Competitive, transparent commission structure",
                  "Dedicated partner support team",
                  "Access to our full application resources",
                  "Professional partnership terms and co-branding materials",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                    <div className="mt-1 bg-secondary/15 p-0.5 rounded-full text-secondary shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/partners">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 px-8 h-14 text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group"
                >
                  Become a Partner
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student Referral Section */}
      <section id="earn" className="py-24 bg-gradient-to-br from-primary to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 text-blue-200">
                <Gift className="w-4 h-4" />
                Student Referral Programme
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Earn a Reward by Referring a Student
              </h2>
              <p className="text-xl text-white/80 mb-6 leading-relaxed">
                Know someone planning to study abroad? Refer them — and receive a reward once they successfully enrol.
              </p>
              <p className="text-white/65 mb-10 leading-relaxed">
                This is a genuine, transparent programme. No gimmicks, no vague promises. Your referral reward is paid only after the student you referred has successfully enrolled at their university or college through our guidance. We believe in being upfront about how this works.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: Share2, step: "01", text: "Refer a friend or contact who is considering studying abroad" },
                  { icon: Users, step: "02", text: "They apply with Universitio's expert guidance and support" },
                  { icon: Award, step: "03", text: "Once they successfully enrol, your reward is paid out" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                    <div className="text-xs font-bold text-secondary/80 tracking-widest w-6 shrink-0">{item.step}</div>
                    <p className="font-medium text-white/90 flex-1">{item.text}</p>
                    <item.icon className="w-5 h-5 text-white/30 shrink-0" />
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/student-referral">
                  <Button
                    size="lg"
                    className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8 h-14 text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                  >
                    Join the Referral Programme
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
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
