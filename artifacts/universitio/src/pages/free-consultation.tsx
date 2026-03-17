import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consultationSchema, type ConsultationInput } from "@/hooks/use-form-mutations";
import { useSubmitConsultation } from "@/hooks/use-form-mutations";
import { trackEvent } from "@/lib/analytics";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { CheckCircle2, Plus, Trash2, Upload, Info } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useState, useRef } from "react";
import { ConsentFields } from "@/components/ui/ConsentFields";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
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
  "Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa",
  "San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain","Sri Lanka",
  "Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo",
  "Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
  "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen",
  "Zambia","Zimbabwe"
];

const COURSE_AREAS = [
  "Business & Management","Engineering","Computer Science & IT","Medicine & Health Sciences",
  "Law","Architecture","Arts & Design","Social Sciences","Natural Sciences","Mathematics & Statistics",
  "Education & Teaching","Media & Communications","Hospitality & Tourism","Agriculture & Environmental Science",
  "Economics & Finance","Pharmacy","Psychology","Other"
];

const STUDY_DESTINATIONS = [
  { value: "UK", label: "United Kingdom" },
  { value: "USA", label: "United States" },
  { value: "Canada", label: "Canada" },
  { value: "Germany", label: "Germany" },
  { value: "Netherlands", label: "Netherlands" },
  { value: "Australia", label: "Australia" },
];

const EDUCATION_LEVELS = [
  "Secondary School (GCSE / O-Level equivalent)",
  "Sixth Form / A-Level equivalent",
  "Foundation / Pathway Programme",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctoral Degree (PhD)",
  "Professional Qualification",
  "Other"
];

const ENGLISH_QUALIFICATION_TYPES = ["IELTS", "TOEFL", "PTE Academic", "Duolingo English Test", "Cambridge (C1/C2)", "Other"];
const ENGLISH_LEVELS = ["Beginner (A1)", "Elementary (A2)", "Intermediate (B1)", "Upper Intermediate (B2)", "Advanced (C1)"];
const BUDGET_OPTIONS = [
  { value: "under10k", label: "Under $10,000 per year" },
  { value: "10k-25k", label: "$10,000 – $25,000 per year" },
  { value: "over25k", label: "Over $25,000 per year" },
];
const HOW_HEARD_OPTIONS = ["Google Search", "Social Media (Instagram, Facebook, TikTok)", "Friend or Family Referral", "Education Fair or Event", "University Recommendation", "WhatsApp / Telegram Group", "YouTube", "Other"];
const CONTACT_METHODS = ["WhatsApp", "Telegram", "Video Call", "Email"];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-3 border-b border-border">
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  );
}

function AdvisoryNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800">{children}</p>
    </div>
  );
}

export default function FreeConsultation() {
  const mutation = useSubmitConsultation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ConsultationInput>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      previousEducation: [{ fieldOfStudy: "", levelOfStudy: "" }],
      intendedCourseArea: "",
      intendedCourseAreaOther: "",
      nationality: "",
      preferredDestinations: [],
      hasEnglishQualification: undefined,
      englishQualificationType: "",
      englishQualificationTypeOther: "",
      englishOverallScore: "",
      englishCurrentLevel: "",
      tuitionBudget: "",
      hasCv: undefined,
      cvFile: undefined,
      maritalStatus: "",
      howDidYouHear: "",
      howDidYouHearOther: "",
      preferredContactMethod: "",
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "previousEducation",
  });

  const watchCourseArea = form.watch("intendedCourseArea");
  const watchHasEnglish = form.watch("hasEnglishQualification");
  const watchEnglishType = form.watch("englishQualificationType");
  const watchBudget = form.watch("tuitionBudget");
  const watchHasCv = form.watch("hasCv");
  const watchMarital = form.watch("maritalStatus");
  const watchDestinations = form.watch("preferredDestinations");
  const watchHowHeard = form.watch("howDidYouHear");

  function toggleDestination(value: string) {
    const current = form.getValues("preferredDestinations") || [];
    if (current.includes(value)) {
      form.setValue("preferredDestinations", current.filter((d) => d !== value), { shouldValidate: true });
    } else if (current.length < 2) {
      form.setValue("preferredDestinations", [...current, value], { shouldValidate: true });
    }
  }

  function onSubmit(values: ConsultationInput) {
    mutation.mutate(values, {
      onSuccess: () => {
        setShowSuccessModal(true);
        trackEvent("consultation_form_submit", {
          event_category: "lead",
          event_label: "Free Consultation Form",
          page_path: "/free-consultation",
        });
      }
    });
  }

  function handleReset() {
    setShowSuccessModal(false);
    setUploadedFileName(null);
    form.reset();
    mutation.reset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Book a Free Consultation | Universitio</title>
        <meta name="description" content="Book your free, no-obligation consultation with Universitio. Tell us about your study goals and we'll help you find the right university and course." />
      </Helmet>
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Book Your Free Consultation</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The more accurately you complete this form, the better we can understand your profile and provide tailored guidance for your study abroad journey.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-border p-6 md:p-10">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">

                {/* ── Section 1: Personal Details ── */}
                <section>
                  <SectionHeading title="Personal Details" description="Let us know who you are so we can personalise your consultation." />

                  <div className="space-y-5">
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
                              inputStyle={{
                                width: "100%",
                                height: "40px",
                                fontSize: "14px",
                                borderRadius: "0.375rem",
                                border: "1px solid hsl(var(--border))",
                                paddingLeft: "48px",
                              }}
                              buttonStyle={{
                                borderRadius: "0.375rem 0 0 0.375rem",
                                border: "1px solid hsl(var(--border))",
                                borderRight: "none",
                                background: "transparent",
                              }}
                              containerStyle={{ width: "100%" }}
                              enableSearch
                              searchPlaceholder="Search countries..."
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
                            <FormControl><SelectTrigger><SelectValue placeholder="Select your nationality" /></SelectTrigger></FormControl>
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
                        <p className="text-xs text-muted-foreground mb-2">This helps us advise on family-related programme options and support.</p>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select marital status" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {watchMarital === "Married" && (watchDestinations || []).includes("UK") && (
                          <AdvisoryNote>
                            For married applicants considering the UK, we recommend exploring research-based programmes (such as MRes or PhD) which may offer additional benefits for accompanying family members.
                          </AdvisoryNote>
                        )}
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* ── Section 2: Education Background ── */}
                <section>
                  <SectionHeading title="Education Background" description="Tell us about your qualifications so we can match you with the right programmes." />

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-3 block">
                        Previous Education <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-muted-foreground mb-4">Add each qualification you hold. You can add more entries below.</p>
                      <div className="space-y-4">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-slate-50 rounded-xl border border-border">
                            <div className="flex-1 w-full">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Field of Study</label>
                              <Input
                                placeholder="e.g. Computer Science"
                                {...form.register(`previousEducation.${index}.fieldOfStudy`)}
                              />
                              {form.formState.errors.previousEducation?.[index]?.fieldOfStudy && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.previousEducation[index]?.fieldOfStudy?.message}</p>
                              )}
                            </div>
                            <div className="flex-1 w-full">
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Level of Study</label>
                              <Select
                                onValueChange={(val) => form.setValue(`previousEducation.${index}.levelOfStudy`, val, { shouldValidate: true })}
                                value={form.watch(`previousEducation.${index}.levelOfStudy`)}
                              >
                                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                                <SelectContent>
                                  {EDUCATION_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              {form.formState.errors.previousEducation?.[index]?.levelOfStudy && (
                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.previousEducation[index]?.levelOfStudy?.message}</p>
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => append({ fieldOfStudy: "", levelOfStudy: "" })}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Another Qualification
                      </Button>
                    </div>

                    <FormField control={form.control} name="intendedCourseArea" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended Course Area <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("intendedCourseAreaOther", ""); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select your intended course area" /></SelectTrigger></FormControl>
                          <SelectContent className="max-h-60">
                            {COURSE_AREAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchCourseArea === "Other" && (
                      <FormField control={form.control} name="intendedCourseAreaOther" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Please specify your intended course area <span className="text-red-500">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Marine Biology" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                </section>

                {/* ── Section 3: Study Preferences ── */}
                <section>
                  <SectionHeading title="Study Preferences" description="Where and how you'd like to study helps us narrow down the best options." />

                  <div className="space-y-5">
                    <FormField control={form.control} name="preferredDestinations" render={() => (
                      <FormItem>
                        <FormLabel>Preferred Study Destination <span className="text-red-500">*</span></FormLabel>
                        <p className="text-xs text-muted-foreground mb-3">You may choose up to 2 destinations.</p>
                        <div className="flex flex-wrap gap-3">
                          {STUDY_DESTINATIONS.map((dest) => {
                            const selected = (watchDestinations || []).includes(dest.value);
                            const disabled = !selected && (watchDestinations || []).length >= 2;
                            return (
                              <button
                                key={dest.value}
                                type="button"
                                disabled={disabled}
                                onClick={() => toggleDestination(dest.value)}
                                className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                  selected
                                    ? "bg-primary text-white border-primary shadow-md"
                                    : disabled
                                      ? "bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed"
                                      : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                                }`}
                              >
                                {dest.label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="tuitionBudget" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tuition Budget <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select your annual budget range" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {BUDGET_OPTIONS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {watchBudget === "under10k" && (
                          <AdvisoryNote>
                            Tuition fees under $10,000 per year may limit options in certain destinations. We can help you explore affordable programmes in Germany, the Netherlands, and select UK and Canadian institutions that offer competitive pricing.
                          </AdvisoryNote>
                        )}
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* ── Section 4: English Language ── */}
                <section>
                  <SectionHeading title="English Language" description="Your English proficiency helps us determine which programmes and pathways are most suitable." />

                  <div className="space-y-5">
                    <FormField control={form.control} name="hasEnglishQualification" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have an English language qualification? <span className="text-red-500">*</span></FormLabel>
                        <div className="flex gap-4 mt-2">
                          {(["yes", "no"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                field.onChange(opt);
                                if (opt === "yes") { form.setValue("englishCurrentLevel", ""); }
                                if (opt === "no") { form.setValue("englishQualificationType", ""); form.setValue("englishQualificationTypeOther", ""); form.setValue("englishOverallScore", ""); }
                              }}
                              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === opt
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-white text-foreground border-border hover:border-primary"
                              }`}
                            >
                              {opt === "yes" ? "Yes" : "No"}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {watchHasEnglish === "yes" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="englishQualificationType" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qualification Type <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("englishQualificationTypeOther", ""); }} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {ENGLISH_QUALIFICATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="englishOverallScore" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Overall Score <span className="text-red-500">*</span></FormLabel>
                              <FormControl><Input placeholder="e.g. 7.0" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                        {watchEnglishType === "Other" && (
                          <FormField control={form.control} name="englishQualificationTypeOther" render={({ field }) => (
                            <FormItem>
                              <FormLabel>Please specify your qualification <span className="text-red-500">*</span></FormLabel>
                              <FormControl><Input placeholder="e.g. IELTS Indicator" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        )}
                      </>
                    )}

                    {watchHasEnglish === "no" && (
                      <FormField control={form.control} name="englishCurrentLevel" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current English Level <span className="text-red-500">*</span></FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select your level" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {ENGLISH_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}
                  </div>
                </section>

                {/* ── Section 5: Additional Information ── */}
                <section>
                  <SectionHeading title="Additional Information" description="A few final details to help us prepare for your consultation." />

                  <div className="space-y-5">
                    <FormField control={form.control} name="hasCv" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do you have a CV or resume to share? <span className="text-red-500">*</span></FormLabel>
                        <div className="flex gap-4 mt-2">
                          {(["yes", "no"] as const).map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => { field.onChange(opt); if (opt === "no") { form.setValue("cvFile", undefined); setUploadedFileName(null); } }}
                              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === opt
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-white text-foreground border-border hover:border-primary"
                              }`}
                            >
                              {opt === "yes" ? "Yes" : "No"}
                            </button>
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
                            {uploadedFileName ? (
                              <p className="text-sm font-medium text-foreground">{uploadedFileName}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Click to upload (PDF, DOC, DOCX — max 5 MB)</p>
                            )}
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx"
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  field.onChange(files);
                                  setUploadedFileName(files[0].name);
                                }
                              }}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    )}

                    <FormField control={form.control} name="howDidYouHear" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How did you hear about us?</FormLabel>
                        <Select onValueChange={(val) => { field.onChange(val); if (val !== "Other") form.setValue("howDidYouHearOther", ""); }} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select an option (optional)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {HOW_HEARD_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
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
                          {CONTACT_METHODS.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => field.onChange(method)}
                              className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                                field.value === method
                                  ? "bg-primary text-white border-primary shadow-md"
                                  : "bg-white text-foreground border-border hover:border-primary hover:text-primary"
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </section>

                {/* ── Consent ── */}
                <div className="pt-4 border-t border-border">
                  <FormField
                    control={form.control}
                    name="marketingOptOut"
                    render={({ field }) => (
                      <ConsentFields
                        marketingOptOut={field.value ?? false}
                        termsAccepted={form.watch("termsAccepted") === true}
                        onMarketingOptOutChange={field.onChange}
                        onTermsAcceptedChange={(v) => form.setValue("termsAccepted", v as true, { shouldValidate: true })}
                        termsError={form.formState.errors.termsAccepted?.message}
                      />
                    )}
                  />
                </div>

                {/* ── Submit ── */}
                <div className="pt-4 flex flex-col items-center">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full md:w-auto px-12 h-14 rounded-full text-lg bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Submit Consultation Request"}
                  </Button>
                </div>

              </form>
            </Form>
          </div>

        </div>
      </main>

      <Footer />

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <DialogTitle className="text-2xl font-bold">Thank You!</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground mt-3 leading-relaxed">
              Your request has been received successfully. We will contact you within up to 24 hours using your preferred method of contact.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <Button onClick={handleReset} className="rounded-full px-8">
              Submit Another Request
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
