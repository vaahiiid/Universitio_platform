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
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Plus, Trash2, Upload,
  Info, Award, BookOpen, Globe, Languages, Wallet, User, AlertTriangle,
  TrendingUp, ArrowRight
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useRef, useCallback } from "react";
import { computeScores, type AssessmentProfile, type DestinationScore } from "@/lib/assessmentScoring";

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
];

const STUDY_LEVELS = ["Foundation / Pathway", "College", "Bachelor's", "Master's", "PhD / Research"];

const COURSE_AREAS = [
  "Business and Management", "Computer Science / IT", "Engineering", "Health and Nursing",
  "Medicine", "Law", "Architecture", "Art and Design", "Education", "Social Sciences",
  "Psychology", "Media and Communications", "Hospitality and Tourism", "Finance and Accounting",
  "Marketing", "Data Science / AI", "English / Humanities", "Other"
];

const QUALIFICATION_LEVELS = [
  "High School", "Diploma / College Diploma", "Bachelor's Degree", "Master's Degree", "Other"
];

const LANGUAGE_TYPES = [
  "IELTS Academic", "IELTS General", "TOEFL", "PTE Academic",
  "Duolingo English Test", "Cambridge English", "German Language Certificate", "Other"
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
  "Google Search", "Google Search Ads", "Instagram", "Facebook", "LinkedIn", "Friend Referral", "Other"
];

const CONTACT_METHODS = ["WhatsApp", "Telegram", "Video Call", "Email"];

const STEPS = [
  { label: "Basic Profile", icon: User },
  { label: "Study Plans", icon: Globe },
  { label: "Academic Background", icon: BookOpen },
  { label: "Language", icon: Languages },
  { label: "Budget & More", icon: Wallet },
  { label: "Results", icon: Award },
];

const formSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().min(7, "A valid mobile number is required"),
  email: z.string().email("A valid email address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  destinations: z.array(z.string()).min(1, "Select at least one destination").max(2, "You may choose up to 2"),
  studyLevel: z.string().min(1, "Study level is required"),
  courseArea: z.string().min(1, "Course area is required"),
  courseAreaOther: z.string().optional(),
  highestQualification: z.string().min(1, "Highest qualification is required"),
  previousEducation: z.array(z.object({
    qualificationLevel: z.string(),
    fieldOfStudy: z.string(),
  })).optional(),
  academicPerformance: z.string().min(1, "Academic performance is required"),
  fieldAlignment: z.string().min(1, "Please answer this question"),
  hasLanguageQualification: z.enum(["yes", "no"], { required_error: "Required" }),
  languageQualificationType: z.string().optional(),
  languageQualificationOther: z.string().optional(),
  languageScore: z.string().optional(),
  englishLevel: z.string().optional(),
  budget: z.string().min(1, "Budget is required"),
  additionalStrengths: z.array(z.string()).optional(),
  hasResearchExperience: z.enum(["yes", "no"]).optional(),
  hasCv: z.enum(["yes", "no"]).optional(),
  cvFile: z.any().optional(),
  howDidYouHear: z.string().optional(),
  howDidYouHearOther: z.string().optional(),
  preferredContactMethod: z.string().min(1, "Contact method is required"),
  wantsSuggestions: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.courseArea === "Other" && (!data.courseAreaOther || data.courseAreaOther.trim().length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["courseAreaOther"] });
  }
  if (data.hasLanguageQualification === "yes") {
    if (!data.languageQualificationType) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["languageQualificationType"] });
    if (data.languageQualificationType === "Other" && (!data.languageQualificationOther || data.languageQualificationOther.trim().length < 1))
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["languageQualificationOther"] });
    if (!data.languageScore) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Score is required", path: ["languageScore"] });
  }
  if (data.hasLanguageQualification === "no" && !data.englishLevel)
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["englishLevel"] });
  if (data.hasCv === "yes" && (!data.cvFile || (data.cvFile instanceof FileList && data.cvFile.length === 0)))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please upload your CV", path: ["cvFile"] });
  if (data.howDidYouHear === "Other" && (!data.howDidYouHearOther || data.howDidYouHearOther.trim().length < 1))
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify", path: ["howDidYouHearOther"] });
});

type FormValues = z.infer<typeof formSchema>;

const STEP_FIELDS: Record<number, (keyof FormValues)[]> = {
  0: ["fullName", "mobile", "email", "dateOfBirth", "nationality", "maritalStatus"],
  1: ["destinations", "studyLevel", "courseArea", "courseAreaOther"],
  2: ["highestQualification", "academicPerformance", "fieldAlignment"],
  3: ["hasLanguageQualification", "languageQualificationType", "languageQualificationOther", "languageScore", "englishLevel"],
  4: ["budget", "additionalStrengths", "hasResearchExperience", "hasCv", "cvFile"],
  5: ["preferredContactMethod"],
};

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

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  let color = "#ef4444";
  if (score >= 80) color = "#16a34a";
  else if (score >= 60) color = "#2563eb";
  else if (score >= 40) color = "#d97706";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}%</span>
        <span className="text-xs text-muted-foreground font-medium">Estimated Score</span>
      </div>
    </div>
  );
}

export default function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [results, setResults] = useState<DestinationScore[] | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "", mobile: "", email: "", dateOfBirth: "", nationality: "", maritalStatus: "",
      destinations: [], studyLevel: "", courseArea: "", courseAreaOther: "",
      highestQualification: "", previousEducation: [{ qualificationLevel: "", fieldOfStudy: "" }],
      academicPerformance: "", fieldAlignment: "",
      hasLanguageQualification: undefined, languageQualificationType: "", languageQualificationOther: "",
      languageScore: "", englishLevel: "",
      budget: "", additionalStrengths: [], hasResearchExperience: undefined, hasCv: undefined, cvFile: undefined,
      howDidYouHear: "", howDidYouHearOther: "", preferredContactMethod: "", wantsSuggestions: "",
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
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (!fieldsToValidate) return;
    const valid = await form.trigger(fieldsToValidate as any);
    if (!valid) return;

    if (currentStep === 4) {
      const values = form.getValues();
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
      setResults(scores);
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, form]);

  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit() {
    setShowSuccessModal(true);
  }

  function handleReset() {
    setShowSuccessModal(false);
    setResults(null);
    setCurrentStep(0);
    setUploadedFileName(null);
    form.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {currentStep === 0 && !results && (
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Free Admissions Assessment</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-3">
                Complete this assessment carefully so we can better understand your profile and estimate your admission potential more accurately.
              </p>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                This free tool provides an estimated readiness score based on your profile — it is not a guarantee of admission.
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
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Your Assessment Results</h1>
              <p className="text-muted-foreground mt-2">Based on the information you provided, here is your estimated admission potential.</p>
            </div>
          )}

          <ProgressBar currentStep={currentStep} />

          <div className="bg-white rounded-3xl shadow-xl border border-border p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>

                {/* ── STEP 0: Basic Profile ── */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Basic Profile</h2>
                    <p className="text-sm text-muted-foreground mb-4">Tell us a little about yourself.</p>

                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl><Input placeholder="e.g. Amina Mohammed" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
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
                  </div>
                )}

                {/* ── STEP 1: Study Plans ── */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Study Plans</h2>
                    <p className="text-sm text-muted-foreground mb-4">Where and what would you like to study?</p>

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

                {/* ── STEP 2: Academic Background ── */}
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
                            </div>
                            <div className="flex-1 w-full">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Field of Study</label>
                              <Input placeholder="e.g. Computer Science" {...form.register(`previousEducation.${index}.fieldOfStudy`)} />
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
                            {["Excellent", "Good", "Average", "Weak"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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

                {/* ── STEP 3: Language & Qualifications ── */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Language & Qualifications</h2>
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

                {/* ── STEP 4: Budget & Additional ── */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <h2 className="text-xl font-bold text-foreground mb-1">Budget & Additional Factors</h2>
                    <p className="text-sm text-muted-foreground mb-4">Financial and extra profile information.</p>

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
                        {watchBudget === "under10k" && (
                          <AdvisoryNote>
                            For study in the UK, this budget is generally not sufficient. For Canada and the USA, options may be limited. Some European destinations may still offer possible pathways at this budget level.
                          </AdvisoryNote>
                        )}
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">Additional Profile Strengths</label>
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

                {/* ── STEP 5: Results ── */}
                {currentStep === 5 && results && (
                  <div className="space-y-8">
                    {/* Score Cards */}
                    <div className={`grid gap-6 ${results.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                      {results.map((r) => (
                        <div key={r.destination} className="flex flex-col items-center p-8 rounded-2xl border border-border bg-gradient-to-b from-white to-slate-50">
                          <h3 className="text-lg font-bold text-foreground mb-4">
                            {DESTINATIONS.find(d => d.value === r.destination)?.label || r.destination}
                          </h3>
                          <ScoreRing score={r.score} />
                          <p className={`text-sm font-semibold mt-4 text-center ${r.bandColor}`}>{r.band}</p>
                          {r.restricted && r.restrictionMessage && (
                            <AdvisoryNote variant="warning">{r.restrictionMessage}</AdvisoryNote>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Observations */}
                    <div className="bg-slate-50 rounded-2xl p-6 border border-border">
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Key Observations
                      </h3>
                      <ul className="space-y-3">
                        {(results[0]?.observations || []).map((obs, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                            <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                              {i + 1}
                            </div>
                            {obs}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvement CTA (shown if any score < 60) */}
                    {results.some(r => r.score < 60) && (
                      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 text-center">
                        <h3 className="text-lg font-bold text-foreground mb-2">Want to Improve Your Score?</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Would you like us to contact you with personalised suggestions to help improve your profile and increase your admission potential?
                        </p>
                        <FormField control={form.control} name="wantsSuggestions" render={({ field }) => (
                          <FormItem>
                            <div className="flex justify-center gap-4">
                              {[{ value: "yes", label: "Yes, contact me" }, { value: "no", label: "No, thanks" }].map((opt) => (
                                <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                                  className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                    field.value === opt.value ? "bg-primary text-white border-primary shadow-md" : "bg-white text-foreground border-border hover:border-primary"
                                  }`}>{opt.label}</button>
                              ))}
                            </div>
                          </FormItem>
                        )} />
                      </div>
                    )}

                    {/* Lead follow-up fields */}
                    <div className="space-y-5 pt-4 border-t border-border">
                      <h3 className="text-lg font-bold text-foreground">Almost Done — A Few Final Details</h3>

                      <FormField control={form.control} name="howDidYouHear" render={({ field }) => (
                        <FormItem>
                          <FormLabel>How did you hear about us?</FormLabel>
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
                    </div>
                  </div>
                )}

                {/* ── Navigation ── */}
                <div className="flex justify-between items-center mt-10 pt-6 border-t border-border">
                  {currentStep > 0 && currentStep < STEPS.length - 1 ? (
                    <Button type="button" variant="outline" onClick={goBack} className="rounded-full px-6">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : currentStep === STEPS.length - 1 ? (
                    <Button type="button" variant="outline" onClick={goBack} className="rounded-full px-6">
                      <ChevronLeft className="w-4 h-4 mr-1" /> Back
                    </Button>
                  ) : <div />}

                  {currentStep < STEPS.length - 1 ? (
                    <Button type="button" onClick={validateAndNext} className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-md">
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button type="submit" className="rounded-full px-8 bg-primary hover:bg-primary/90 text-white shadow-lg">
                      Submit Assessment <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>

              </form>
            </Form>
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <DialogTitle className="text-2xl font-bold">Thank You!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-3 leading-relaxed">
              Your assessment has been submitted successfully. We will review your information and contact you within up to 24 hours using your preferred method.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button onClick={handleReset} className="rounded-full px-8">Start New Assessment</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
