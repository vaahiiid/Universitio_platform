import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { MessageSquare, Zap, BookOpen } from "lucide-react";

export function AskiMatePreview() {
  const [, setLocation] = useLocation();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-background border-b border-border/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div>
            <div className="inline-block bg-red-500/10 text-red-600 px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              🆕 NEW FEATURE
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Meet AskiMate AI
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your personal education mentor. Get expert guidance whenever you need it. AskiMate connects you with real mentors who understand your goals and support your journey.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  icon: MessageSquare,
                  title: "Real Mentors",
                  desc: "Connect with experienced mentors who've guided hundreds of students",
                },
                {
                  icon: BookOpen,
                  title: "Document Review",
                  desc: "Get detailed feedback on your essays, CVs, and applications",
                },
                {
                  icon: Zap,
                  title: "Flexible Plans",
                  desc: "Choose Free or Premium based on your needs",
                },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                onClick={() => setLocation("/askimate")}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                Learn More
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation("/askimate-signup")}
              >
                Get Started Free
              </Button>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
              <div className="space-y-4">
                {/* Mock Chat */}
                <div className="bg-white rounded-lg p-4 border border-border/40">
                  <div className="space-y-3">
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-xs text-sm">
                        Which universities suit my profile?
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="bg-muted rounded-lg rounded-tl-none p-3 max-w-xs text-sm">
                        Based on your results, I'd recommend Russell Group universities. Tell me more about your interests.
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div className="bg-primary text-white rounded-lg rounded-tr-none p-3 max-w-xs text-sm">
                        I'm interested in STEM and international experience
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full mt-4 border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-border/40 text-center">
                    <p className="text-2xl font-bold text-primary">500+</p>
                    <p className="text-xs text-muted-foreground">Students Helped</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-border/40 text-center">
                    <p className="text-2xl font-bold text-primary">4.9★</p>
                    <p className="text-xs text-muted-foreground">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
