import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { ArrowLeft, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";

export default function Partners() {
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
              <Users className="w-4 h-4" />
              Partner Programme
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Become a Universitio Partner</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Join our trusted network of education agents, counsellors, and student introducers. Grow your business while helping students access world-class education.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Why Partner With Us?</h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Competitive, transparent commission structure",
                  "Dedicated partner support team on hand",
                  "Access to our full application resources and expertise",
                  "Co-branded materials for your business",
                  "Ongoing training and market updates",
                  "Professional partnership terms from day one",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-foreground">
                    <div className="mt-1 bg-secondary/15 p-0.5 rounded-full text-secondary shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Universitio is a UK-registered education consultancy, ICEF accredited and British Council certified. We hold ourselves to the highest professional standards, and we expect the same from our partners.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-border p-8 shadow-lg">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Application Received</h3>
                  <p className="text-muted-foreground">
                    Thank you for your interest. A member of our partnerships team will be in touch within 2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <h3 className="text-xl font-bold text-foreground mb-2">Partner Application</h3>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name *</label>
                    <Input {...register("name", { required: true })} placeholder="Your full name" className={errors.name ? "border-red-500" : ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email Address *</label>
                    <Input type="email" {...register("email", { required: true })} placeholder="you@example.com" className={errors.email ? "border-red-500" : ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organisation / Business Name</label>
                    <Input {...register("organisation")} placeholder="Your company or agency name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Country *</label>
                    <Input {...register("country", { required: true })} placeholder="Country where you operate" className={errors.country ? "border-red-500" : ""} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tell us about yourself *</label>
                    <Textarea {...register("about", { required: true })} placeholder="Briefly describe your role, experience, and how you work with students..." className={`min-h-[100px] ${errors.about ? "border-red-500" : ""}`} />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12">
                    Submit Application
                  </Button>
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
