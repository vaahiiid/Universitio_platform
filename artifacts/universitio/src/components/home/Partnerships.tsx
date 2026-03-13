import { Link } from "wouter";
import { Check, Users, Gift, Share2, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Partnerships() {
  return (
    <>
      {/* Agents Section */}
      <section id="agents" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {/* business team meeting professional */}
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop" 
                  alt="Education agents collaborating" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-50"></div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold mb-6">
                <Users className="w-4 h-4" /> For Professionals
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Partner With Universitio
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Join our growing network of education agents, counsellors, and student introducers.
              </p>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Are you an education agent, school counsellor, or student mentor? We welcome partnerships with trusted professionals who share our commitment to helping international students. As a Universitio partner, you'll have access to our expertise, resources, and support to help your students succeed — and benefit from a fair, transparent referral structure.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  "Competitive commission structure",
                  "Dedicated partner support team",
                  "Access to our application resources and expertise",
                  "Transparent and professional partnership terms"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                    <div className="mt-1 bg-secondary/20 p-0.5 rounded-full text-secondary">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              
              <Link href="/free-consultation?interest=partnership">
                <Button size="lg" className="rounded-full px-8">
                  Partner With Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Earn as a Student Section */}
      <section id="earn" className="py-24 bg-gradient-to-br from-primary to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm font-semibold mb-6 text-blue-200 border border-white/20">
                <Gift className="w-4 h-4" /> Student Rewards
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Refer a Friend — Earn a Reward
              </h2>
              <p className="text-xl text-blue-100 mb-6">
                Students who refer others to Universitio can earn a reward when their friend completes a successful consultation.
              </p>
              <p className="text-white/70 mb-10 leading-relaxed">
                Know someone who wants to study abroad? Share Universitio with your friends, classmates, or family — and when they book a consultation, you both benefit. It's our way of saying thank you for spreading the word about what we do.
              </p>
              
              <div className="space-y-6 mb-10">
                {[
                  { icon: Share2, text: "Share your referral with a friend" },
                  { icon: Users, text: "They book a free consultation" },
                  { icon: Award, text: "You earn your reward" }
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="font-bold text-sm">{i + 1}</span>
                    </div>
                    <p className="font-semibold text-white/90">{step.text}</p>
                    <step.icon className="w-5 h-5 text-white/40 ml-auto" />
                  </div>
                ))}
              </div>
              
              <Link href="/free-consultation?interest=referral">
                <Button size="lg" className="rounded-full bg-secondary hover:bg-secondary/90 text-white px-8 border-none h-14 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group">
                  Start Referring
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="hidden lg:flex justify-center relative">
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-[100px]"></div>
              {/* Using a visually interesting SVG composite for the "rewards" graphic instead of stock image */}
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
