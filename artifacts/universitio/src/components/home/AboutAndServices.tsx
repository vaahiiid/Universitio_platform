import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, CheckCircle2, GraduationCap, BookOpen, Mic2, FileText,
  Home, PlaneTakeoff, BadgeCheck, ShieldCheck, Globe, Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiFetch } from "@/lib/api";

/* ---------- Shared helpers ---------- */

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-foreground">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";

function HowDidYouHear() {
  return (
    <Field label="How did you hear about us?">
      <select className={inputCls} name="howDidYouHear">
        <option value="">Select…</option>
        {["Google Search", "Social Media", "Friend / Family", "University", "Agent", "Other"].map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

function PreferredContact() {
  return (
    <Field label="Preferred contact method">
      <select className={inputCls} name="preferredContact">
        <option value="">Select…</option>
        {["Email", "WhatsApp", "Phone call"].map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </Field>
  );
}

function BaseFields() {
  return (
    <>
      <Field label="Full name" required>
        <input name="fullName" required className={inputCls} placeholder="Your full name" />
      </Field>
      <Field label="Email address" required>
        <input name="email" type="email" required className={inputCls} placeholder="you@example.com" />
      </Field>
      <Field label="Phone number">
        <input name="phone" className={inputCls} placeholder="+44 7700 000000" />
      </Field>
    </>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="w-full rounded-full bg-primary hover:bg-primary/90 text-white">
      {loading ? "Sending…" : "Submit Request"}
    </Button>
  );
}

function SuccessMsg({ onClose }: { onClose: () => void }) {
  return (
    <div className="py-8 text-center space-y-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-foreground">Request Received!</h3>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto">
        Thank you — we'll review your request and be in touch shortly.
      </p>
      <Button onClick={onClose} variant="outline" className="rounded-full">Close</Button>
    </div>
  );
}

function useServiceForm(serviceType: string, onClose: () => void) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body: Record<string, string> = { serviceType };
    fd.forEach((v, k) => { body[k] = v as string; });
    try {
      await apiFetch("/leads/service-request", { method: "POST", body: JSON.stringify(body) });
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  }

  return { loading, sent, error, handleSubmit };
}

/* ---------- Per-service forms ---------- */

function AdmissionsForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("Study Admissions", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <Field label="Which level are you applying for?" required>
        <select name="studyLevel" required className={inputCls}>
          <option value="">Select…</option>
          {["School / College", "Bachelor's Degree", "Master's Degree", "Research-based Programme (UK Dependant Visa)", "PhD"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Current level of education">
        <input name="currentEducation" className={inputCls} placeholder="e.g. A-Levels, Bachelor's" />
      </Field>
      <Field label="What did you study?">
        <input name="fieldOfStudy" className={inputCls} placeholder="e.g. Business, Engineering" />
      </Field>
      <HowDidYouHear />
      <PreferredContact />
      <Field label="Additional notes">
        <textarea name="notes" rows={3} className={inputCls} placeholder="Any other details…" />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

function IeltsForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("IELTS Preparation", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <PreferredContact />
      <HowDidYouHear />
      <Field label="Target IELTS band score">
        <select name="targetScore" className={inputCls}>
          <option value="">Select…</option>
          {["5.5", "6.0", "6.5", "7.0", "7.5", "8.0", "8.5+"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Additional notes">
        <textarea name="notes" rows={3} className={inputCls} placeholder="Tell us your current level or specific concerns…" />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

function InterviewForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("Interview Preparation", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <Field label="Interview type" required>
        <select name="interviewType" required className={inputCls}>
          <option value="">Select…</option>
          {["University Interview", "Embassy Interview", "Both"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="University name">
        <input name="universityName" className={inputCls} placeholder="e.g. University of Manchester" />
      </Field>
      <Field label="Programme / Subject">
        <input name="programme" className={inputCls} placeholder="e.g. MSc Computer Science" />
      </Field>
      <Field label="Level of study">
        <select name="studyLevel" className={inputCls}>
          <option value="">Select…</option>
          {["Undergraduate", "Postgraduate", "PhD"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Additional notes">
        <textarea name="notes" rows={3} className={inputCls} />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

function SopCvForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("SOP & CV Guidance", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <Field label="Service needed" required>
        <select name="serviceNeeded" required className={inputCls}>
          <option value="">Select…</option>
          {["SOP (Statement of Purpose)", "Academic CV", "Both"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="University / Universities">
        <input name="universities" className={inputCls} placeholder="e.g. UCL, King's College London" />
      </Field>
      <Field label="Programme">
        <input name="programme" className={inputCls} placeholder="e.g. LLM International Law" />
      </Field>
      <Field label="Level of study">
        <select name="studyLevel" className={inputCls}>
          <option value="">Select…</option>
          {["Undergraduate", "Postgraduate", "PhD"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Additional notes">
        <textarea name="notes" rows={3} className={inputCls} />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

function AccommodationForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("Student Accommodation", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <Field label="University name" required>
        <input name="universityName" required className={inputCls} placeholder="e.g. University of Leeds" />
      </Field>
      <Field label="City">
        <input name="city" className={inputCls} placeholder="e.g. Leeds" />
      </Field>
      <Field label="Intake term">
        <select name="intakeTerm" className={inputCls}>
          <option value="">Select…</option>
          {["September / October", "January / February", "April / May"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Year">
        <select name="year" className={inputCls}>
          <option value="">Select…</option>
          {["2025", "2026", "2027"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Weekly accommodation budget (£)">
        <select name="budget" className={inputCls}>
          <option value="">Select…</option>
          {["Under £100", "£100–£150", "£150–£200", "£200–£250", "£250+"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Additional notes">
        <textarea name="notes" rows={3} className={inputCls} />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

function AirportForm({ onClose }: { onClose: () => void }) {
  const { loading, sent, error, handleSubmit } = useServiceForm("Airport Transfer", onClose);
  if (sent) return <SuccessMsg onClose={onClose} />;
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BaseFields />
      <Field label="Arrival airport" required>
        <select name="arrivalAirport" required className={inputCls}>
          <option value="">Select…</option>
          {[
            "London Heathrow (LHR)",
            "London Gatwick (LGW)",
            "Manchester Airport (MAN)",
            "Birmingham Airport (BHX)",
            "London Stansted (STN)",
            "London Luton (LTN)",
            "Other",
          ].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Destination city" required>
        <input name="destinationCity" required className={inputCls} placeholder="e.g. Birmingham" />
      </Field>
      <Field label="Number of passengers" required>
        <select name="passengers" required className={inputCls}>
          <option value="">Select…</option>
          {["1", "2", "3", "4", "5+"].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </Field>
      <Field label="Additional notes">
        <textarea name="notes" rows={2} className={inputCls} placeholder="Arrival date/time, luggage details…" />
      </Field>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <SubmitButton loading={loading} />
    </form>
  );
}

/* ---------- Service definitions ---------- */

interface ServiceDef {
  id: string;
  icon: React.ElementType;
  title: string;
  short: string;
  description: string;
  includes?: string[];
  FormContent: React.FC<{ onClose: () => void }>;
}

const SERVICES: ServiceDef[] = [
  {
    id: "admissions",
    icon: GraduationCap,
    title: "Study Admissions",
    short: "End-to-end application support from school placements to postgraduate and PhD programmes.",
    description: "Full admissions support from school and college placements to postgraduate and research programmes. We guide you through every step of the application process.",
    includes: [
      "School & College Admissions",
      "Bachelor's Degrees",
      "Master's Degrees",
      "Research-based programmes suitable for UK dependant visas",
      "PhD programmes",
    ],
    FormContent: AdmissionsForm,
  },
  {
    id: "ielts",
    icon: BookOpen,
    title: "IELTS Preparation",
    short: "Private, personalised IELTS training designed to hit your target band score efficiently.",
    description: "Private IELTS preparation for students planning to study in English-speaking countries. Personalised training designed to help students reach their target band score as efficiently as possible.",
    FormContent: IeltsForm,
  },
  {
    id: "interview",
    icon: Mic2,
    title: "Interview Preparation",
    short: "Mock sessions for university credibility interviews and visa interviews with structured feedback.",
    description: "Mock interview preparation for university credibility interviews and visa interviews. Students practise with realistic questions and structured guidance.",
    FormContent: InterviewForm,
  },
  {
    id: "sop-cv",
    icon: FileText,
    title: "SOP & CV Guidance",
    short: "Mentored guidance to craft a compelling Statement of Purpose and academic CV.",
    description: "We guide students step-by-step in crafting strong Statements of Purpose and academic CVs. Our role is to mentor and review — helping students present their story clearly and professionally.",
    FormContent: SopCvForm,
  },
  {
    id: "accommodation",
    icon: Home,
    title: "Student Accommodation",
    short: "Assistance finding and reserving the right UK accommodation before you arrive.",
    description: "We assist students in finding and reserving accommodation in the UK. This service is available only for single students.",
    FormContent: AccommodationForm,
  },
  {
    id: "airport",
    icon: PlaneTakeoff,
    title: "Airport Transfer",
    short: "Reliable UK airport pickup to your city of residence — no stress on arrival day.",
    description: "Airport pickup service from UK airports to the student's city of residence.",
    FormContent: AirportForm,
  },
];

/* ---------- Trust credentials for the About section ---------- */

const TRUST_POINTS = [
  {
    icon: BadgeCheck,
    label: "ICEF Accredited",
    detail: "Internationally recognised accreditation for education agencies — your assurance of quality.",
  },
  {
    icon: ShieldCheck,
    label: "British Council Certified",
    detail: "Approved by the British Council, the gold standard for UK education professionals.",
  },
  {
    icon: Users2,
    label: "Birmingham Chambers Member",
    detail: "Proud member of the Greater Birmingham Chambers of Commerce.",
  },
  {
    icon: Globe,
    label: "Global Student Support",
    detail: "Serving students from Hong Kong, China, Nigeria, Pakistan, India, the Middle East, and beyond.",
  },
];

/* ---------- Main component ---------- */

export function AboutAndServices() {
  const [openModal, setOpenModal] = useState<string | null>(null);
  const activeService = SERVICES.find(s => s.id === openModal);

  return (
    <>
      {/* ── About + Why Choose Us (merged two-column trust section) ── */}
      <section id="about" className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left — About text */}
            <div>
              <div className="inline-block bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold mb-5">
                About Universitio
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-5 text-foreground leading-tight">
                Your Global Gateway to Education Abroad
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5">
                At Universitio, we help students from all around the world apply to trusted schools, colleges, and universities abroad. Whether you're aiming for the world's top-ranked institutions or exploring the right fit for your ambitions, we make the application process simple, personal, and stress-free.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                UK-registered education consultancy · Company No. 15168670 · ICO Registered
              </p>
              <Link href="/free-consultation">
                <Button className="rounded-full bg-primary hover:bg-primary/90 px-8 shadow-md hover:shadow-lg transition-all">
                  Book Your Free Consultation
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Right — Trust credential points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TRUST_POINTS.map((tp) => (
                <div
                  key={tp.label}
                  className="flex gap-4 items-start bg-muted/40 rounded-2xl p-5 border border-border/60 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <tp.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-0.5">{tp.label}</p>
                    <p className="text-xs text-muted-foreground leading-snug">{tp.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Card Grid ── */}
      <section id="services" className="py-12 md:py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">Our Services</h2>
            <p className="text-base md:text-lg text-muted-foreground">
              Comprehensive support at every stage — from application to arrival.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {SERVICES.map((service) => (
              <button
                key={service.id}
                onClick={() => setOpenModal(service.id)}
                className="group text-left bg-white rounded-2xl border border-border shadow-sm p-6 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                  <service.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-200" />
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base leading-snug">{service.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.short}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Request this service <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Service Request Modal ── */}
      <Dialog open={!!openModal} onOpenChange={(open) => { if (!open) setOpenModal(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {activeService ? `Request: ${activeService.title}` : "Service Request"}
            </DialogTitle>
            {activeService && (
              <p className="text-sm text-muted-foreground mt-1">{activeService.description}</p>
            )}
            {activeService?.includes && (
              <ul className="mt-2 space-y-1">
                {activeService.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </DialogHeader>
          <div className="mt-2">
            {activeService && <activeService.FormContent onClose={() => setOpenModal(null)} />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
