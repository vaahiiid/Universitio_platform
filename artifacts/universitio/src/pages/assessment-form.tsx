import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, Upload,
  Info, Award, BookOpen, Globe, Languages, Wallet, User, AlertTriangle,
  TrendingUp, ArrowRight, Send, MessageCircle
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useRef, useCallback, useEffect } from "react";
import { ConsentFields } from "@/components/ui/ConsentFields";
import { computeScores, getBand, type AssessmentProfile, type DestinationScore } from "@/lib/assessmentScoring";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";

import { COUNTRIES, STUDY_DESTINATIONS as DESTINATIONS } from "@/data/countries";

const STUDY_LEVELS = ["Foundation / Pathway", "College", "Bachelor's", "Master's", "PhD / Research"];

const COURSE_AREAS = [
  "Business and Management", "Computer Science / IT", "Engineering", "Health and Nursing",
  "Medicine", "Law", "Architecture", "Art and Design", "Education", "Social Sciences",
  "Psychology", "Media and Communications", "Hospitality and Tourism", "Finance and Accounting",
  "Marketing", "Data Science / AI", "English / Humanities", "Environmental Science", "Other"
];

const QUALIFICATION_LEVELS = [
  "High School", "Diploma / College Diploma", "Bachelor's Degree", "Master's Degree", "Other"
];

const LANGUAGE_TYPES = [
  "IELTS Academic", "IELTS General", "TOEFL", "PTE Academic",
  "Duolingo English Test", "Cambridge English", "OET", "German Language Certificate", "Other"
];

const ENGLISH_LEVELS = [
  "Beginner", "Elementary", "Pre-Intermediate", "Intermediate", "Upper-Intermediate", "Advanced"
];

const ADDITIONAL_STRENGTHS = [
  "GRE", "GMAT", "SAT", "A-Levels", "Foundation Programme",
  "Published Research", "Research Experience", "Work Experience",
  "Internship Experience", "Portfolio", "Relevant Professional Certifications"
];

const HOW_HEARD = [
  "Google Search", "Google Search Ads", "Instagram", "Facebook", "LinkedIn", "TikTok", "Friend Referral", "Other"
];

const CONTACT_METHODS = ["WhatsApp", "Telegram", "Video Call", "Email"];

const STEPS = [
  { label: "Study Destination", icon: Globe },
  { label: "Course Area", icon: BookOpen },
  { label: "Academic", icon: Award },
  { label: "Language", icon: Languages },
  { label: "Budget & More", icon: Wallet },
  { label: "Personal Details", icon: User },
];

const stepSchemas = {
  0: z.object({
    destinations: z.array(z.string()).min(1, "Select at least one destination").max(2, "You may choose up to 2"),
    studyLevel: z.string().min(1, "Study level is required"),
  }),
  1: z.object({
    courseArea: z.string().min(1, "Course area is required"),
    courseAreaOther: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.courseArea === "Other" && (!data.courseAreaOther || data.courseAreaOther.trim().length < 2)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["courseAreaOther"] });
    }
  }),
  2: z.object({
    highestQualification: z.string().min(1, "Highest qualification is required"),
    previousEducation: z.array(z.object({
      qualificationLevel: z.string().min(1, "Please select a qualification level"),
      fieldOfStudy: z.string().min(1, "Please enter a field of study"),
    })).min(1, "Please add at least one education entry"),
    academicPerformance: z.string().min(1, "Academic performance is required"),
    fieldAlignment: z.string().min(1, "Please answer this question"),
  }),
  3: z.object({
    hasLanguageQualification: z.enum(["yes", "no"], { required_error: "Required" }),
    languageQualificationType: z.string().optional(),
    languageQualificationOther: z.string().optional(),
    languageScore: z.string().optional(),
    englishLevel: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.hasLanguageQualification === "yes") {
      if (!data.languageQualificationType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["languageQualificationType"] });
      if (data.languageQualificationType === "Other" && (!data.languageQualificationOther || data.languageQualificationOther.trim().length < 1))
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["languageQualificationOther"] });
      if (!data.languageScore) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Score is required", path: ["languageScore"] });
    }
    if (data.hasLanguageQualification === "no" && !data.englishLevel)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["englishLevel"] });
  }),
  4: z.object({
    budget: z.string().min(1, "Budget is required"),
    additionalStrengths: z.array(z.string()).optional(),
    hasResearchExperience: z.enum(["yes", "no"], { required_error: "Please select an option" }),
    hasCv: z.enum(["yes", "no"], { required_error: "Please select an option" }),
    cvFile: z.any().optional(),
  }).superRefine((data, ctx) => {
    if (data.hasCv === "yes" && (!data.cvFile || (data.cvFile instanceof FileList && data.cvFile.length === 0)))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please upload your CV", path: ["cvFile"] });
  }),
  5: z.object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("A valid email address is required"),
    mobile: z.string().min(7, "A valid mobile number is required"),
    dateOfBirth: z.string().min(1, "Date of birth is required"),
    nationality: z.string().min(1, "Nationality is required"),
    maritalStatus: z.string().min(1, "Marital status is required"),
    preferredContactMethod: z.string().min(1, "Contact method is required"),
    howDidYouHear: z.string().optional(),
    howDidYouHearOther: z.string().optional(),
  }).superRefine((data, ctx) => {
    if (data.howDidYouHear === "Other" && (!data.howDidYouHearOther || data.howDidYouHearOther.trim().length < 1))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["howDidYouHearOther"] });
  }),
} as const;

const formSchema = z.object({
  ...stepSchemas[0].shape,
  ...stepSchemas[1].innerType().shape,
  ...stepSchemas[2].shape,
  ...stepSchemas[3].innerType().shape,
  ...stepSchemas[4].innerType().shape,
  ...stepSchemas[5].innerType().shape,
});

type FormValues = z.infer<typeof formSchema>;

function AdvisoryNote({ children, variant = "warning" }: { children: React.ReactNode; variant?: "warning" | "info" }) {
  const colors = variant === "warning"
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : "bg-blue-50 border-blue-200 text-blue-800";
  const Icon = variant === "warning" ? AlertTriangle : Info;
  return (
    <div className={`flex gap-3 items-start border rounded-xl p-4 mt-3 ${colors}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm">{children}</p>
    </div>
  );
}

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isCompleted = i < currentStep;
          return (
            <div key={i} className="flex flex-col items-center relative z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                isCompleted ? "bg-primary text-white" :
                isActive ? "bg-primary text-white ring-4 ring-primary/20" :
                "bg-white text-muted-foreground border-2 border-border"
              }`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs mt-2 font-medium hidden sm:block ${
                isActive ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreRing({ score, size = 160, animated = false }: { score: number; size?: number; animated?: boolean }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={circumference}
        strokeDashoffset={animated ? strokeDashoffset : 0}
        className="text-primary transition-all duration-1000 ease-out"
        strokeLinecap="round"
      />
      <text x={size / 2} y={size / 2 + 7} textAnchor="middle" fontSize="32" fontWeight="700" className="fill-primary">
        {Math.round(score)}
      </text>
      <text x={size / 2} y={size / 2 + 28} textAnchor="middle" fontSize="12" className="fill-muted-foreground">
        /100
      </text>
    </svg>
  );
}

function ResultsView({ results, onReset }: { results: DestinationScore[]; onReset: () => void }) {
  const anyBelow70 = results.some((r) => r.score < 70);
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Your Admission Readiness Score</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Below is an estimate of your admission potential based on the information you provided. Each destination score reflects your readiness for study at that location.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {results.map((result) => {
          const scoreBand = getBand(result.score);
          const bandColor = scoreBand === "Strong" ? "text-green-600" : scoreBand === "Moderate" ? "text-blue-600" : "text-amber-600";
          const bgColor = scoreBand === "Strong" ? "bg-green-50 border-green-200" : scoreBand === "Moderate" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200";
          return (
            <div key={result.destination} className={`${bgColor} rounded-2xl border p-6 text-center max-w-xs`}>
              <h2 className="text-lg font-bold text-foreground mb-4">{result.destination}</h2>
              <div className="flex justify-center mb-4">
                <ScoreRing score={result.score} size={160} animated={true} />
              </div>
              <p className={`text-sm font-semibold ${bandColor} mb-2`}>{scoreBand} Fit</p>
              <p className="text-xs text-muted-foreground">{scoreBand === "Strong" ? "Strong chances of admission." : scoreBand === "Moderate" ? "Good potential for admission." : "Strengthen your profile for better chances."}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-6 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2"><Info className="w-5 h-5" /> Understanding Your Score</h3>
          <ul className="space-y-2 text-blue-900">
            <li>• <strong>Strong (80–100):</strong> Excellent chances of admission. Your profile aligns well with programme requirements.</li>
            <li>• <strong>Moderate (60–79):</strong> Good potential. You meet key criteria, but strengthening specific areas could improve your chances.</li>
            <li>• <strong>Below 60:</strong> Consider working with our consultants to identify pathways to strengthen your profile.</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Important Disclaimer</h3>
          <p className="text-amber-900">
            This assessment is an <strong>estimated tool</strong> based on general criteria. It is <strong>not a guarantee</strong> of admission. Final admission decisions are made by universities and depend on many factors, including your complete application, essays, interviews, and specific programme requirements. We recommend discussing your results with our consultants for personalised guidance.
          </p>
        </div>

        {anyBelow70 && (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20 text-center">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Want to Strengthen Your Profile?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our consultants can provide personalised guidance to help you improve your admission potential and identify the best pathways for your goals.
            </p>
            <a
              href="/free-consultation"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-all"
            >
              Book a Free Consultation <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}

        <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={onReset} variant="outline" className="rounded-full px-8">
            Start New Assessment
          </Button>
          <a href="/free-consultation">
            <Button className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white w-full sm:w-auto">
              Get Expert Guidance <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<DestinationScore[] | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      destinations: [], studyLevel: "", courseArea: "", courseAreaOther: "",
      highestQualification: "", previousEducation: [{ qualificationLevel: "", fieldOfStudy: "" }],
      academicPerformance: "", fieldAlignment: "",
      hasLanguageQualification: undefined, languageQualificationType: "", languageQualificationOther: "",
      languageScore: "", englishLevel: "",
      budget: "", additionalStrengths: [], hasResearchExperience: undefined, hasCv: undefined, cvFile: undefined,
      fullName: "", email: "", mobile: "", dateOfBirth: "", nationality: "", maritalStatus: "",
      howDidYouHear: "", howDidYouHearOther: "", preferredContactMethod: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "previousEducation" });

  const watchCourseArea = form.watch("courseArea");
  const watchHasLang = form.watch("hasLanguageQualification");
  const watchLangType = form.watch("languageQualificationType");
  const watchBudget = form.watch("budget");
  const watchDestinations = form.watch("destinations");
  const watchHasCv = form.watch("hasCv");
  const watchHowHeard = form.watch("howDidYouHear");

  function toggleDestination(value: string) {
    const current = form.getValues("destinations") || [];
    if (current.includes(value)) {
      form.setValue("destinations", current.filter((d) => d !== value), { shouldValidate: true });
    } else if (current.length < 2) {
      form.setValue("destinations", [...current, value], { shouldValidate: true });
    }
  }

  const validateAndNext = useCallback(async () => {
    const schema = stepSchemas[currentStep as keyof typeof stepSchemas];
    if (!schema) return;
    const values = form.getValues();
    const result = schema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const path = issue.path.join(".") as keyof FormValues;
        form.setError(path, { type: "manual", message: issue.message });
      }
      return;
    }
    form.clearErrors();
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, form]);

  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const [submitting, setSubmitting] = useState(false);
  const [marketingOptOut, setMarketingOptOut] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");
  const { toast } = useToast();

  async function handleSubmitAndReveal() {
    if (!termsAccepted) {
      setTermsError("You must accept the Terms and Conditions and Privacy Policy to continue.");
      return;
    }
    setTermsError("");
    const values = form.getValues();
    const step5Result = stepSchemas[5].safeParse(values);
    if (!step5Result.success) {
      for (const issue of step5Result.error.issues) {
        const path = issue.path.join(".") as keyof FormValues;
        form.setError(path, { type: "manual", message: issue.message });
      }
      return;
    }

    const profile: AssessmentProfile = {
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
      maritalStatus: values.maritalStatus,
      destinations: values.destinations,
      studyLevel: values.studyLevel,
      courseArea: values.courseArea,
      highestQualification: values.highestQualification,
      academicPerformance: values.academicPerformance,
      fieldAlignment: values.fieldAlignment,
      hasLanguageQualification: values.hasLanguageQualification === "yes",
      languageQualificationType: values.languageQualificationType,
      languageScore: values.languageScore,
      englishLevel: values.englishLevel,
      budget: values.budget,
      additionalStrengths: values.additionalStrengths || [],
      hasResearchExperience: values.hasResearchExperience === "yes",
    };
    const scores = computeScores(profile);

    setSubmitting(true);
    try {
      const cvFile = values.cvFile instanceof FileList ? values.cvFile[0] : values.cvFile instanceof File ? values.cvFile : null;
      const formData = new FormData();

      for (const [key, value] of Object.entries(values)) {
        if (key === "cvFile") continue;
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      }

      if (cvFile) formData.append("cvFile", cvFile);
      formData.append("marketingOptOut", marketingOptOut ? "true" : "false");
      formData.append("termsAccepted", termsAccepted ? "true" : "false");

      const res = await fetch(apiUrl("/leads/assessment"), {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Submission failed");
      }
    } catch (err) {
      setSubmitting(false);
      toast({
        title: "Submission failed",
        description: err instanceof Error ? err.message : "Could not submit your assessment. Please try again.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(false);

    setResults(scores);
    setSubmitted(true);
    trackEvent("assessment_completed", {
      event_category: "lead",
      event_label: "Admission Assessment",
      destinations: scores.map((s) => s.destination).join(", "),
      page_path: "/assessment-form",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setSubmitted(false);
    setResults(null);
    setCurrentStep(0);
    setUploadedFileName(null);
    form.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow pt-28 pb-24">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <ResultsView results={results} onReset={handleReset} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Free Admissions Assessment | Universitio</title>
        <meta name="description" content="Take the free Universitio admissions assessment to estimate your chances at top UK universities. Get a personalised readiness score in under 5 minutes." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {currentStep === 0 && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Check Your Admission Chances in 30 Seconds</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
                Get a quick estimate of your admission chances based on your profile. Free and no commitment.
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                This is an estimate only and does not guarantee admission.
              </p>
            </div>
          )}
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Free Admissions Assessment</h1>
            </div>
          )}
          {currentStep === STEPS.length - 1 && (
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Final Details</h1>
              <p className="text-muted-foreground mt-2">Just a few last details, then we'll show you your result.</p>
            </div>
          )}

          <ProgressBar currentStep={currentStep} />

          <div key={currentStep} className="bg-white rounded-3xl shadow-xl border border-border p-6 md:p-10 animate-in fade-in slide-in-from-right-4 duration-300">
            <Form {...form}>
              <form onSubmit={(e) => { e.preventDefault(); }}>

                {currentStep === 0 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Study Destination & Level</h2>
                    <p className="text-sm text-muted-foreground mb-4">Where and at what level would you like to study?</p>

                    <FormField control={form.control} name="destinations" render={() => (
                      <FormItem>
                        <FormLabel>Preferred Study Destinations <span className="text-red-500">*</span></FormLabel>
                        <p className="text-xs text-muted-foreground mb-3">You may choose up to 2 destinations.</p>
                        <div className="flex flex-wrap gap-3">
                          {DESTINATIONS.map((dest) => {
                            const selected = (watchDestinations || []).includes(dest.value);
                            const disabled = !selected && (watchDestinations || []).length >= 2;
                            return (
                              <button key={dest.value} type="button" disabled={disabled} onClick={() => toggleDestination(dest.value)}
                                className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                  selected ? "bg-primary text-white border-primary shadow-md" :
                                  disabled ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed" :
                                  "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                                }`}>{dest.label}</button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="studyLevel" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended Level of Study <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {STUDY_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Course Area</h2>
                    <p className="text-sm text-muted-foreground mb-4">What would you like to study?</p>

                    <FormField control={form.control} name="courseArea" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended Course Area <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("courseAreaOther", ""); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select course area" /></SelectTrigger></FormControl>
                          <SelectContent className="max-h-60">
                            {COURSE_AREAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchCourseArea === "Other" && (
                      <FormField control={form.control} name="courseAreaOther" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Marine Biology" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Academic Background</h2>
                    <p className="text-sm text-muted-foreground mb-4">Your qualifications help us assess readiness for your intended programme.</p>

                    <FormField control={form.control} name="highestQualification" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highest Completed Qualification <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {QUALIFICATION_LEVELS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Previous Field(s) of Study</label>
                      <p className="text-xs text-muted-foreground mb-3">Add each qualification you hold.</p>
                      <div className="space-y-3">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-slate-50 rounded-xl border border-border">
                            <div className="flex-1 w-full">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Qualification Level</label>
                              <Select
                                onValueChange={(val) => form.setValue(`previousEducation.${index}.qualificationLevel`, val)}
                                value={form.watch(`previousEducation.${index}.qualificationLevel`)}
                              >
                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                  {QUALIFICATION_LEVELS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {form.formState.errors.previousEducation?.[index]?.qualificationLevel && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.previousEducation[index].qualificationLevel?.message}</p>
                              )}
                            </div>
                            <div className="flex-1 w-full">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Field of Study</label>
                              <Input placeholder="e.g. Computer Science" {...form.register(`previousEducation.${index}.fieldOfStudy`)} />
                              {form.formState.errors.previousEducation?.[index]?.fieldOfStudy && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.previousEducation[index].fieldOfStudy?.message}</p>
                              )}
                            </div>
                            {fields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="shrink-0 mt-5 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => remove(index)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => append({ qualificationLevel: "", fieldOfStudy: "" })}>
                        <Plus className="w-4 h-4 mr-1" /> Add Another
                      </Button>
                    </div>

                    <FormField control={form.control} name="academicPerformance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Performance <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Self-assessed performance" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Distinction">
                              <span className="font-medium">Distinction</span>
                              <span className="text-xs text-muted-foreground ml-1.5">— First-class / 70%+ / GPA 3.7+</span>
                            </SelectItem>
                            <SelectItem value="Merit">
                              <span className="font-medium">Merit</span>
                              <span className="text-xs text-muted-foreground ml-1.5">— Upper Second / 60–69% / GPA 3.0–3.6</span>
                            </SelectItem>
                            <SelectItem value="Pass">
                              <span className="font-medium">Pass</span>
                              <span className="text-xs text-muted-foreground ml-1.5">— Lower Second or Third / 50–59% / GPA 2.0–2.9</span>
                            </SelectItem>
                            <SelectItem value="Needs Improvement">
                              <span className="font-medium">Needs Improvement</span>
                              <span className="text-xs text-muted-foreground ml-1.5">— Below 50% / GPA below 2.0</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="fieldAlignment" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Is your intended course related to your previous studies? <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {["Yes, same field", "Yes, related field", "No, different field", "Not sure yet"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">English Language Qualification</h2>
                    <p className="text-sm text-muted-foreground mb-4">Your language proficiency is an important factor in determining suitable programmes.</p>

                    <FormField control={form.control} name="hasLanguageQualification" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have a language qualification? <span className="text-red-500">*</span></FormLabel>
                        <div className="flex gap-4 mt-2">
                          {(["yes", "no"] as const).map((opt) => (
                            <button key={opt} type="button" onClick={() => {
                              field.onChange(opt);
                              if (opt === "yes") form.setValue("englishLevel", "");
                              if (opt === "no") { form.setValue("languageQualificationType", ""); form.setValue("languageQualificationOther", ""); form.setValue("languageScore", ""); }
                            }} className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                              field.value === opt ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary"
                            }`}>{opt === "yes" ? "Yes" : "No"}</button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchHasLang === "yes" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="languageQualificationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification Type <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("languageQualificationOther", ""); }} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {LANGUAGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="languageScore" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overall Score / Level <span className="text-red-500">*</span></FormLabel>
                              <FormControl><Input placeholder="e.g. 7.0" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        {watchLangType === "Other" && (
                          <FormField control={form.control} name="languageQualificationOther" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Please specify <span className="text-red-500">*</span></FormLabel>
                              <FormControl><Input placeholder="e.g. OET" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </>
                    )}

                    {watchHasLang === "no" && (
                      <FormField control={form.control} name="englishLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current English Level <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {ENGLISH_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Budget & Profile Strengths</h2>
                    <p className="text-sm text-muted-foreground mb-4">Financial and additional profile information.</p>

                    <FormField control={form.control} name="budget" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tuition Budget <span className="text-red-500">*</span></FormLabel>
                        <p className="text-xs text-muted-foreground mb-2">Please provide realistic information so we can guide you more effectively and recommend suitable options.</p>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="under10k">Under $10,000 per year</SelectItem>
                            <SelectItem value="10k-20k">$10,000 to $20,000 per year</SelectItem>
                            <SelectItem value="over20k">Over $20,000 per year</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {watchBudget === "under10k" && watchDestinations && watchDestinations.length > 0 && (
                          <AdvisoryNote>
                            {(() => {
                              const dests = watchDestinations || [];
                              const hasUK = dests.includes("UK");
                              const hasUSA = dests.includes("USA");
                              const hasCanada = dests.includes("Canada");
                              const hasAustralia = dests.includes("Australia");
                              const hasEurope = dests.includes("Germany") || dests.includes("Netherlands");
                              const parts: string[] = [];
                              if (hasUK) parts.push("For study in the UK, this budget is generally not sufficient to cover tuition fees.");
                              if (hasUSA) parts.push("In the USA, options at this budget level are very limited.");
                              if (hasCanada) parts.push("For Canada, this budget may restrict your programme choices.");
                              if (hasAustralia) parts.push("In Australia, tuition fees typically exceed this budget range.");
                              if (hasEurope) parts.push("Some European destinations such as Germany or the Netherlands may still offer possible pathways at this budget level.");
                              if (parts.length === 0) parts.push("At this budget level, options may be limited. We can help identify suitable pathways.");
                              return parts.join(" ");
                            })()}
                          </AdvisoryNote>
                        )}
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Additional Profile Strengths (Optional)</label>
                      <p className="text-xs text-muted-foreground mb-3">Select any that apply to you.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ADDITIONAL_STRENGTHS.map((strength) => (
                          <label key={strength} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors cursor-pointer">
                            <Checkbox
                              checked={(form.watch("additionalStrengths") || []).includes(strength)}
                              onCheckedChange={(checked) => {
                                const current = form.getValues("additionalStrengths") || [];
                                form.setValue(
                                  "additionalStrengths",
                                  checked ? [...current, strength] : current.filter((s) => s !== strength)
                                );
                              }}
                            />
                            <span className="text-sm text-foreground">{strength}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <FormField control={form.control} name="hasResearchExperience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have research experience or research-based academic work?</FormLabel>
                        <div className="flex gap-4 mt-2">
                          {(["yes", "no"] as const).map((opt) => (
                            <button key={opt} type="button" onClick={() => field.onChange(opt)}
                              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === opt ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary"
                              }`}>{opt === "yes" ? "Yes" : "No"}</button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="hasCv" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have a CV?</FormLabel>
                        <p className="text-xs text-muted-foreground mb-2">Providing a CV at this stage is not mandatory, but it can help us assist you more effectively.</p>
                        <div className="flex gap-4 mt-1">
                          {(["yes", "no"] as const).map((opt) => (
                            <button key={opt} type="button" onClick={() => { field.onChange(opt); if (opt === "no") { form.setValue("cvFile", undefined); setUploadedFileName(null); } }}
                              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === opt ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary"
                              }`}>{opt === "yes" ? "Yes" : "No"}</button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchHasCv === "yes" && (
                      <FormField control={form.control} name="cvFile" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload your CV <span className="text-red-500">*</span></FormLabel>
                          <div
                            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                            {uploadedFileName
                              ? <p className="text-sm font-medium text-foreground">{uploadedFileName}</p>
                              : <p className="text-sm text-muted-foreground">Click to upload (PDF, DOC, DOCX)</p>}
                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) { field.onChange(files); setUploadedFileName(files[0].name); }
                              }} />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">Personal Details</h2>
                    <p className="text-sm text-muted-foreground mb-4">Your contact information so we can reach you with your results.</p>

                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="e.g. Amina Mohammed" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => {
                        const dob = field.value;
                        let calculatedAge: number | null = null;
                        if (dob) {
                          const birth = new Date(dob);
                          const now = new Date();
                          let age = now.getFullYear() - birth.getFullYear();
                          const m = now.getMonth() - birth.getMonth();
                          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                          if (age >= 0 && age <= 120) calculatedAge = age;
                        }
                        return (
                        <FormItem>
                          <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          {calculatedAge !== null && (
                            <p className="text-xs text-muted-foreground mt-1">Age: {calculatedAge} years</p>
                          )}
                          <FormMessage />
                        </FormItem>
                        );
                      }} />
                      <FormField control={form.control} name="nationality" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger></FormControl>
                            <SelectContent className="max-h-60">
                              {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="maritalStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status <span className="text-red-500">*</span></FormLabel>
                        <p className="text-xs text-muted-foreground mb-2">This helps us understand suitability for certain study pathways, especially where dependant-related restrictions may apply.</p>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="preferredContactMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method <span className="text-red-500">*</span></FormLabel>
                        <div className="flex flex-wrap gap-3 mt-2">
                          {CONTACT_METHODS.map((m) => (
                            <button key={m} type="button" onClick={() => field.onChange(m)}
                              className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === m ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                              }`}>{m}</button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="howDidYouHear" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us? (Optional)</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("howDidYouHearOther", ""); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select (optional)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {HOW_HEARD.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    {watchHowHeard === "Other" && (
                      <FormField control={form.control} name="howDidYouHearOther" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. A blog post" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
                  {currentStep > 0 ? (
                    <Button type="button" variant="outline" onClick={goBack} className="rounded-full px-6">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : <div />}

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={validateAndNext} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-md">
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="flex flex-col items-end gap-4 w-full">
                      <div className="w-full">
                        <ConsentFields marketingOptOut={marketingOptOut} termsAccepted={termsAccepted} onMarketingOptOutChange={setMarketingOptOut} onTermsAcceptedChange={setTermsAccepted} termsError={termsError} />
                      </div>
                      <Button type="button" onClick={handleSubmitAndReveal} disabled={submitting} className="rounded-full px-8 py-3 bg-primary hover:bg-primary/90 text-white shadow-lg text-base font-semibold">
                        {submitting ? "Processing..." : <>Submit and View My Result <ArrowRight className="w-5 h-5 ml-2" /></>}
                      </Button>
                    </div>
                  )}
                </div>

              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
