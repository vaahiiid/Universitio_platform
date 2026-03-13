import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useMemo } from "react";
import { apiUrl } from "@/lib/api";
import {
  ArrowLeft, Check, Users, Handshake, Globe, ShieldCheck,
  BookOpen, Award, Search, X, Loader2
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { COUNTRIES, STUDY_DESTINATIONS as DESTINATIONS } from "@/data/countries";

const partnerSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  position: z.string().min(2, "Position or job title is required"),
  organisationName: z.string().min(2, "Organisation name is required"),
  email: z.string().email("A valid email address is required"),
  phone: z.string().min(7, "A valid contact number is required"),
  website: z.string().optional(),
  servicesDescription: z.string().min(10, "Please describe your services"),
  nationalities: z.array(z.string()).min(1, "Please select at least one nationality"),
  basedIn: z.string().min(1, "Please select your country"),
  destinations: z.array(z.string()).min(1, "Please select at least one destination"),
  notes: z.string().optional(),
});

type PartnerFormValues = z.infer<typeof partnerSchema>;

function CountryMultiSelect({
  selected, onChange, placeholder
}: {
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() =>
    COUNTRIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  function toggle(country: string) {
    if (selected.includes(country)) {
      onChange(selected.filter(c => c !== country));
    } else {
      onChange([...selected, country]);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className="min-h-[42px] border border-border rounded-lg p-2 cursor-pointer hover:border-primary/40 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? (
          <span className="text-sm text-muted-foreground px-1">{placeholder || "Click to select..."}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map(c => (
              <span key={c} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                {c}
                <button type="button" onClick={(e) => { e.stopPropagation(); toggle(c); }} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="border border-border rounded-xl bg-white shadow-lg overflow-hidden">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="pl-9 h-9"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2 text-center">No countries found</p>
            ) : (
              filtered.map(country => (
                <label key={country} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-muted/50 cursor-pointer text-sm">
                  <Checkbox
                    checked={selected.includes(country)}
                    onCheckedChange={() => toggle(country)}
                  />
                  {country}
                </label>
              ))
            )}
          </div>
          <div className="p-2 border-t border-border flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{selected.length} selected</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-xs h-7">
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Partners() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "", position: "", organisationName: "",
      email: "", phone: "", website: "", servicesDescription: "",
      nationalities: [], basedIn: "", destinations: [], notes: "",
    },
  });

  const watchDestinations = form.watch("destinations");

  function toggleDestination(value: string) {
    const current = form.getValues("destinations") || [];
    if (current.includes(value)) {
      form.setValue("destinations", current.filter(d => d !== value), { shouldValidate: true });
    } else {
      form.setValue("destinations", [...current, value], { shouldValidate: true });
    }
  }

  async function onSubmit(values: PartnerFormValues) {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(apiUrl("/leads/partners"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error || "Submission failed");
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
          </Link>

          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-5">
              <Handshake className="w-4 h-4" />
              Partnership Programme
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Become a Universitio Partner</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Work with us to support international students applying to universities worldwide.
              If you are an education agency, counsellor, introducer, or student recruitment partner,
              we would be glad to learn more about your organisation.
            </p>
            <Button
              size="lg"
              className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg"
              onClick={() => document.getElementById("partner-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start Partner Enquiry <ArrowLeft className="w-4 h-4 ml-2 rotate-[270deg]" />
            </Button>
          </div>

          {submitted ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-border p-10 md:p-14 shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Enquiry Received</h2>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Thank you for your interest in partnering with Universitio. Your enquiry has been received,
                  and our team will review your information and contact you shortly.
                </p>
                <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" className="mt-8 rounded-full px-8">
                  Submit Another Enquiry
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-5 text-foreground">Why Partner With Us?</h2>
                  <ul className="space-y-4">
                    {[
                      { icon: Award, text: "Competitive, transparent commission structure" },
                      { icon: Users, text: "Dedicated partner support team on hand" },
                      { icon: BookOpen, text: "Access to our full application resources and expertise" },
                      { icon: Globe, text: "Co-branded materials for your business" },
                      { icon: ShieldCheck, text: "Ongoing training and market updates" },
                      { icon: Handshake, text: "Professional partnership terms from day one" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-foreground text-sm">
                        <div className="mt-0.5 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                          <item.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5">
                  <p className="text-sm text-foreground leading-relaxed">
                    Universitio is a UK-registered education consultancy (Company No. 15168670),
                    ICEF accredited and certified by the British Council. We hold ourselves to the
                    highest professional standards, and we expect the same from our partners.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div id="partner-form" className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-xl scroll-mt-28">
                  <h3 className="text-xl font-bold text-foreground mb-1">Partner Enquiry</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tell us about your organisation and how you work with students.</p>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                      <div className="space-y-1.5 pb-2">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Your Details</h4>
                        <div className="h-px bg-border" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="e.g. James Carter" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="position" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position / Job Title <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="e.g. Director of Recruitment" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="organisationName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisation Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Global Education Partners Ltd" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="email" placeholder="you@company.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <PhoneInput
                                country="gb"
                                value={field.value}
                                onChange={(phone) => field.onChange("+" + phone)}
                                inputStyle={{ width: "100%", height: "40px", fontSize: "14px", borderRadius: "0.375rem", border: "1px solid hsl(var(--border))", paddingLeft: "48px" }}
                                buttonStyle={{ borderRadius: "0.375rem 0 0 0.375rem", border: "1px solid hsl(var(--border))", borderRight: "none", background: "transparent" }}
                                containerStyle={{ width: "100%" }}
                                enableSearch searchPlaceholder="Search countries..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organisation Website</FormLabel>
                          <FormControl><Input placeholder="https://www.example.com" {...field} /></FormControl>
                        </FormItem>
                      )} />

                      <div className="space-y-1.5 pt-2 pb-2">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">About Your Organisation</h4>
                        <div className="h-px bg-border" />
                      </div>

                      <FormField control={form.control} name="servicesDescription" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Description of Services <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about what your organisation does, how you work with students, and the services you offer..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="nationalities" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which student nationalities do you mainly work with? <span className="text-red-500">*</span></FormLabel>
                          <CountryMultiSelect
                            selected={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Click to select nationalities..."
                          />
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="basedIn" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which country is your organisation based in? <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                            <SelectContent className="max-h-60">
                              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="space-y-1.5 pt-2 pb-2">
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Destinations & Notes</h4>
                        <div className="h-px bg-border" />
                      </div>

                      <FormField control={form.control} name="destinations" render={() => (
                        <FormItem>
                          <FormLabel>Which study destinations are you interested in? <span className="text-red-500">*</span></FormLabel>
                          <p className="text-xs text-muted-foreground mb-3">Select all that apply.</p>
                          <div className="flex flex-wrap gap-2.5">
                            {DESTINATIONS.map(dest => {
                              const selected = (watchDestinations || []).includes(dest.value);
                              return (
                                <button key={dest.value} type="button" onClick={() => toggleDestination(dest.value)}
                                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                                    selected ? "bg-primary text-white border-primary shadow-md" :
                                    "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                                  }`}>{dest.label}</button>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="notes" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes / Comments</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Anything else you would like us to know..." className="min-h-[80px]" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />

                      {submitError && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                          {submitError}
                        </div>
                      )}

                      <Button type="submit" size="lg" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base font-semibold shadow-lg">
                        {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : "Submit Partner Enquiry"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
