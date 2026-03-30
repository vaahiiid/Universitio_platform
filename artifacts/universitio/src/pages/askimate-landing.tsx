import { Helmet } from "react-helmet-async";
import { useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, MessageSquare, BookOpen, Zap } from "lucide-react";

export default function AskiMateLanding() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "Basic Mentoring",
      price: "Free",
      period: "",
      monthlyPrice: null,
      features: [
        "Up to 5 questions per week",
        "Response within 24–48 hours",
        "General guidance",
        "Access to mentor network",
        "Document upload (up to 3 files)",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Premium Mentoring",
      price: "£12",
      period: "monthly",
      trial: "3 days free",
      altPrices: [
        { amount: "£30", period: "every 3 months", monthly: "£10/month" },
        { amount: "£65", period: "every 6 months", monthly: "£10.83/month" },
      ],
      features: [
        "Ask questions anytime",
        "Priority live chat access",
        "Real-time responses when online",
        "Same-day replies guaranteed",
        "Full document review",
        "Personalised application strategy",
        "Continuous support throughout journey",
        "Unlimited document uploads",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>AskiMate AI — Your Personal Education Mentor</title>
        <meta name="description" content="Get personalised mentoring guidance for your education journey. Human-first support, flexible plans, real mentors." />
        <link rel="canonical" href="https://universitio.com/askimate" />
      </Helmet>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pb-28 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
            🆕 NEW — Try Free for 3 Days
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Personal Education Mentor
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Get expert guidance every step of the way. Whether you're planning your applications or navigating university decisions, AskiMate connects you with real mentors who understand your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/askimate-signup")}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Plans
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Students Like You
            </h2>
            <p className="text-lg text-muted-foreground">
              Ideal for students who want to apply by themselves but still need expert guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Real Mentors</h3>
              <p className="text-muted-foreground">
                Connect with experienced mentors who've guided hundreds of students through their education journey.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Document Review</h3>
              <p className="text-muted-foreground">
                Upload and share your documents. Get detailed feedback on essays, CVs, statements, and more.
              </p>
            </div>

            <div className="p-6 border border-border/60 rounded-xl hover:border-border transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Flexible Support</h3>
              <p className="text-muted-foreground">
                Choose your plan based on your needs. Basic guidance or premium priority support—your choice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that works for you. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border-2 p-8 transition-all ${
                  plan.highlighted
                    ? "border-primary bg-primary/5"
                    : "border-border/60 bg-background hover:border-border"
                }`}
              >
                {plan.highlighted && (
                  <div className="inline-block bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                </div>

                {plan.trial && (
                  <div className="mb-4 text-sm font-semibold text-primary">
                    {plan.trial}
                  </div>
                )}

                {plan.altPrices && (
                  <div className="mb-6 space-y-1 text-sm text-muted-foreground">
                    {plan.altPrices.map((alt) => (
                      <div key={alt.period}>
                        {alt.amount} {alt.period} ({alt.monthly})
                      </div>
                    ))}
                  </div>
                )}

                {!plan.period && <div className="mb-6 h-6"></div>}

                <button
                  onClick={() => setLocation("/askimate-signup")}
                  className={`w-full py-2.5 rounded-lg font-medium mb-8 transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of students already using AskiMate for their education journey.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/askimate-signup")}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            Sign Up Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
