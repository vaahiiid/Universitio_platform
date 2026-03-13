import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowLeft, Award, Check, Gift, Share2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function StudentReferral() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = () => setSubmitted(true);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-10">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </Link>

          <div className="mb-12">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Gift className="w-4 h-4" />
              Student Referral Programme
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Refer a Student, Earn a Reward</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Know someone planning to study abroad? Introduce them to Universitio. When they successfully enrol, we'll reward you for the introduction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">How It Works</h2>
              <div className="space-y-5 mb-8">
                {[
                  { icon: Share2, step: "01", title: "Refer a Friend", desc: "Tell us about someone you know who is considering studying abroad — in the UK, USA, Canada, or Europe." },
                  { icon: Users, step: "02", title: "They Get Guided", desc: "Your contact works with our team to explore options, prepare a strong application, and submit to their chosen institution." },
                  { icon: Award, step: "03", title: "You Get Rewarded", desc: "Once your referred student successfully enrols at their university or college, your reward is paid. Simple, transparent, no catches." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 bg-muted/50 rounded-2xl p-5 border border-border">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-secondary tracking-widest mb-1">{item.step}</p>
                      <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                <p className="font-semibold mb-1 flex items-center gap-2"><Check className="w-4 h-4 text-amber-600" /> Important to know</p>
                <p>Your referral reward is paid only after the student you referred has successfully enrolled. We believe in being fully transparent about how this works — no surprises, just honest terms.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-border p-8 shadow-lg">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Referral Registered</h3>
                  <p className="text-muted-foreground">
                    Thank you for referring. Our team will reach out to your contact and keep you updated on their progress.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <h3 className="text-xl font-bold text-foreground mb-2">Submit a Referral</h3>
                  <p className="text-sm text-muted-foreground mb-4">Tell us about yourself and the person you're referring.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Name *</label>
                      <Input {...register("yourName", { required: true })} placeholder="Your full name" className={errors.yourName ? "border-red-500" : ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Email *</label>
                      <Input type="email" {...register("yourEmail", { required: true })} placeholder="you@example.com" className={errors.yourEmail ? "border-red-500" : ""} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Referred Student's Name *</label>
                      <Input {...register("refName", { required: true })} placeholder="Their full name" className={errors.refName ? "border-red-500" : ""} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Referred Student's Email *</label>
                      <Input type="email" {...register("refEmail", { required: true })} placeholder="their@example.com" className={errors.refEmail ? "border-red-500" : ""} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Where are they hoping to study?</label>
                    <Input {...register("destination")} placeholder="e.g. United Kingdom, Canada, USA..." />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Anything else we should know?</label>
                    <Textarea {...register("notes")} placeholder="Optional — any additional context about their situation or goals..." className="min-h-[80px]" />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12">
                    Submit Referral
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By submitting, you confirm you have the student's permission to share their details with Universitio.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
