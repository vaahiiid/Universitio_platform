import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useMemo } from "react";
import {
  ArrowLeft, Check, Gift, Share2, Users, Award,
  Search, X, Info, ClipboardCheck
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burma","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia",
  "Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan",
  "Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein",
  "Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania",
  "Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
  "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Republic of the Congo","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
  "Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
  "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const DESTINATIONS = [
  { value: "UK", label: "United Kingdom" },
  { value: "USA", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Australia", label: "Australia" },
  { value: "Europe", label: "Europe (general)" },
];

const referralSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  university: z.string().min(2, "University name is required"),
  nationalities: z.array(z.string()).min(1, "Please select at least one nationality"),
  destinations: z.array(z.string()).min(1, "Please select at least one destination"),
  notes: z.string().optional(),
});

type ReferralFormValues = z.infer<typeof referralSchema>;

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

export default function StudentReferral() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(referralSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "", email: "", dateOfBirth: "", university: "",
      nationalities: [], destinations: [], notes: "",
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

  function onSubmit() {
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <Gift className="w-4 h-4" />
              Student Referral Programme
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Join the Universitio Student Referral Programme</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Refer students who are planning to study abroad and apply through Universitio.
              Applications are reviewed individually, and accepted applicants will be contacted by email.
            </p>
          </div>

          {submitted ? (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl border border-border p-10 md:p-14 shadow-xl text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Application Received</h2>
                <p className="text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Thank you. Your referral programme application has been received successfully.
                  Our team will review your submission, and you will be informed by email if your
                  application is accepted or not.
                </p>
                <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" className="mt-8 rounded-full px-8">
                  Submit Another Application
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-5 text-foreground">How It Works</h2>
                  <div className="space-y-4">
                    {[
                      { icon: Share2, step: "01", title: "Apply to Join", desc: "Complete the form to apply as a Universitio student referrer. We review every application individually." },
                      { icon: Users, step: "02", title: "Refer Students", desc: "Once accepted, introduce students who are planning to study abroad. They will receive full guidance from our team." },
                      { icon: Award, step: "03", title: "Earn Your Reward", desc: "When a student you referred successfully enrols at their institution, you receive your referral reward. Transparent and straightforward." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-border shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary tracking-widest mb-1">{item.step}</p>
                          <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                  <p className="font-semibold mb-1.5 flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" /> Important to know
                  </p>
                  <p className="leading-relaxed">
                    Referral rewards are considered only after the referred student has successfully enrolled.
                    We believe in full transparency — no hidden terms, no surprises.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-800">
                  <p className="font-semibold mb-1.5 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-blue-600 shrink-0" /> Application review
                  </p>
                  <p className="leading-relaxed">
                    After submitting your application, you may be accepted or not accepted into the programme.
                    You will be notified by email with the outcome.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white rounded-3xl border border-border p-6 md:p-8 shadow-xl">
                  <h3 className="text-xl font-bold text-foreground mb-1">Referral Programme Application</h3>
                  <p className="text-sm text-muted-foreground mb-6">Tell us about yourself and the students you plan to refer.</p>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                      <FormField control={form.control} name="fullName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referrer Full Name <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="university" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name of the University Where You Currently Study <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. University of Birmingham" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="nationalities" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Which student nationalities are you planning to refer? <span className="text-red-500">*</span></FormLabel>
                          <CountryMultiSelect
                            selected={field.value}
                            onChange={(val) => field.onChange(val)}
                            placeholder="Click to select nationalities..."
                          />
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="destinations" render={() => (
                        <FormItem>
                          <FormLabel>Which destination countries do you want to refer students for? <span className="text-red-500">*</span></FormLabel>
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

                      <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 text-base font-semibold shadow-lg">
                        Submit Application
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        By submitting, you confirm the information provided is accurate and you agree to
                        the programme terms.
                      </p>
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
