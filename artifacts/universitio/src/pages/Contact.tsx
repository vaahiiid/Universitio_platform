import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { ConsentFields } from "@/components/ui/ConsentFields";

export default function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [marketingOptOut, setMarketingOptOut] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { toast } = useToast();

  const onSubmit = async (data: Record<string, unknown>) => {
    if (!termsAccepted) {
      setTermsError("You must accept the Terms and Conditions and Privacy Policy to continue.");
      return;
    }
    setTermsError("");
    setSubmitting(true);
    try {
      await apiFetch("/leads/contact", {
        method: "POST",
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          phone: data.phone || "",
          subject: data.subject,
          message: data.message,
          marketingOptOut,
          termsAccepted,
        }),
      });
      toast({ title: "Thank you!", description: "Your message has been sent successfully." });
      setIsSubmitted(true);
      reset();
    } catch {
      toast({ title: "Something went wrong", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Universitio — Get in Touch</title>
        <meta name="description" content="Contact Universitio via WhatsApp, email, or our contact form. We're here to help you with your university application journey." />
        <link rel="canonical" href="https://universitio.com/contact" />
      </Helmet>
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/8 via-background to-background border-b border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-xs font-semibold mb-6">
              GET IN TOUCH
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              We're Here to Help
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have a question about your university application? Ready to get started? Reach out to us—we're happy to help guide you on your journey.
            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

              {/* Contact Details */}
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Get in Touch</h2>
                <p className="text-lg text-muted-foreground mb-12 max-w-lg">
                  Have a question? Ready to start your journey? Reach out via WhatsApp, email, social media, or the form.
                </p>

                <div className="space-y-7 mb-12">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/5 text-primary rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">WhatsApp</p>
                      <a href="https://web.whatsapp.com/send?phone=447963345465" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => trackEvent("whatsapp_click", { event_category: "contact", event_label: "WhatsApp Button" })}>+44 7963 345465</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-primary/5 text-primary rounded-full flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Email</p>
                      <a href="mailto:info@universitio.co.uk" className="text-muted-foreground hover:text-primary transition-colors">info@universitio.co.uk</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-green-50 text-green-600 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.68-1.232A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.487 0-4.807-.735-6.756-1.998l-.168-.112-3.474.916.93-3.39-.122-.177A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">WhatsApp & Telegram</p>
                      <div className="flex flex-col gap-1">
                        <a href="https://web.whatsapp.com/send?phone=447963345465" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors" onClick={() => trackEvent("whatsapp_click", { event_category: "contact", event_label: "WhatsApp Button" })}>Chat on WhatsApp</a>
                        <a href="https://t.me/universitio" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Message on Telegram</a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Head Office</p>
                      <p className="text-muted-foreground">
                        44 Birmingham Road, Birmingham,<br /> England, B72 1QQ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social links */}
                <div className="mb-10">
                  <p className="font-semibold text-foreground mb-4">Connect With Us</p>
                  <div className="flex gap-3 flex-wrap">
                    <a href="https://www.instagram.com/universitio_" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.facebook.com/universitioco" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://www.linkedin.com/company/universitio" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                    <span aria-label="TikTok" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                    </span>
                    <span aria-label="YouTube" className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                    </span>
                  </div>
                </div>

                {/* Free Consultation CTA */}
                <Link href="/free-consultation">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white px-8 h-12 shadow-md hover:shadow-lg transition-all group">
                    Book a Free Consultation
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Contact Form */}
              <div>
                <div className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-border shadow-lg">
                  {isSubmitted ? (
                    <div className="py-12 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">Thank You!</h3>
                      <p className="text-muted-foreground">
                        Your message has been sent successfully. A member of our team will get back to you shortly.
                      </p>
                      <Button
                        className="mt-8"
                        variant="outline"
                        onClick={() => setIsSubmitted(false)}
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <h3 className="text-2xl font-bold text-foreground mb-6">Send a Message</h3>

                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name *</label>
                        <Input
                          id="name"
                          {...register("name", { required: true })}
                          className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address *</label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email", { required: true })}
                            className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                            placeholder="john@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium text-foreground">Phone Number</label>
                          <Input
                            id="phone"
                            {...register("phone")}
                            placeholder="+44 7XXX XXXXXX"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject *</label>
                        <Input
                          id="subject"
                          {...register("subject", { required: true })}
                          className={errors.subject ? "border-red-500 focus-visible:ring-red-500" : ""}
                          placeholder="How can we help?"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="message" className="text-sm font-medium text-foreground">Message *</label>
                        <Textarea
                          id="message"
                          {...register("message", { required: true })}
                          className={`min-h-[120px] ${errors.message ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          placeholder="Please provide details about your inquiry..."
                        />
                      </div>

                      <ConsentFields marketingOptOut={marketingOptOut} termsAccepted={termsAccepted} onMarketingOptOutChange={setMarketingOptOut} onTermsAcceptedChange={setTermsAccepted} termsError={termsError} />

                      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base shadow-md">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</> : "Send Message"}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
