import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { apiUrl } from "@/lib/api";

export const consultationSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  mobile: z.string().min(7, "A valid mobile number is required"),
  email: z.string().email("A valid email address is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  previousEducation: z.array(z.object({
    fieldOfStudy: z.string().min(1, "Field of study is required"),
    levelOfStudy: z.string().min(1, "Level of study is required"),
  })).min(1, "At least one education entry is required"),
  intendedCourseArea: z.string().min(1, "Please select your intended course area"),
  intendedCourseAreaOther: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  preferredDestinations: z.array(z.string()).min(1, "Please select at least one destination").max(2, "You may choose up to 2 destinations"),
  hasEnglishQualification: z.enum(["yes", "no"], { required_error: "Please indicate your English language status" }),
  englishQualificationType: z.string().optional(),
  englishQualificationTypeOther: z.string().optional(),
  englishOverallScore: z.string().optional(),
  englishCurrentLevel: z.string().optional(),
  tuitionBudget: z.string().min(1, "Please select your tuition budget"),
  hasCv: z.enum(["yes", "no"], { required_error: "Please indicate whether you have a CV" }),
  cvFile: z.any().optional(),
  maritalStatus: z.string().min(1, "Marital status is required"),
  howDidYouHear: z.string().optional(),
  howDidYouHearOther: z.string().optional(),
  preferredContactMethod: z.string().min(1, "Please select your preferred contact method"),
  marketingOptOut: z.boolean().optional().default(false),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Conditions and Privacy Policy to continue." }) }),
}).superRefine((data, ctx) => {
  if (data.intendedCourseArea === "Other" && (!data.intendedCourseAreaOther || data.intendedCourseAreaOther.trim().length < 2)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify your intended course area", path: ["intendedCourseAreaOther"] });
  }
  if (data.hasEnglishQualification === "yes") {
    if (!data.englishQualificationType || data.englishQualificationType.trim().length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your qualification type", path: ["englishQualificationType"] });
    }
    if (data.englishQualificationType === "Other" && (!data.englishQualificationTypeOther || data.englishQualificationTypeOther.trim().length < 1)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify your qualification type", path: ["englishQualificationTypeOther"] });
    }
    if (!data.englishOverallScore || data.englishOverallScore.trim().length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter your overall score", path: ["englishOverallScore"] });
    }
  }
  if (data.hasEnglishQualification === "no") {
    if (!data.englishCurrentLevel || data.englishCurrentLevel.trim().length < 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please select your current English level", path: ["englishCurrentLevel"] });
    }
  }
  if (data.hasCv === "yes" && (!data.cvFile || (data.cvFile instanceof FileList && data.cvFile.length === 0))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please upload your CV", path: ["cvFile"] });
  }
  if (data.howDidYouHear === "Other" && (!data.howDidYouHearOther || data.howDidYouHearOther.trim().length < 1)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please specify how you heard about us", path: ["howDidYouHearOther"] });
  }
});

export type ConsultationInput = z.infer<typeof consultationSchema>;

async function submitConsultation(data: ConsultationInput) {
  const formData = new FormData();

  const cvFile = data.cvFile instanceof FileList ? data.cvFile[0] : data.cvFile instanceof File ? data.cvFile : null;

  for (const [key, value] of Object.entries(data)) {
    if (key === "cvFile") continue;
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "true" : "false");
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }

  if (cvFile) {
    formData.append("cvFile", cvFile);
  }

  const res = await fetch(apiUrl("/leads/consultation"), {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || "Submission failed");
  }

  return res.json();
}

export function useSubmitConsultation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: submitConsultation,
    onSuccess: () => {
      toast({
        title: "Request Submitted Successfully",
        description: "One of our education experts will contact you shortly.",
      });
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: err instanceof Error ? err.message : "Please try again later or contact us directly.",
      });
    }
  });
}
