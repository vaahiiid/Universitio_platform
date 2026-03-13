import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

const mockApiCall = async <T>(data: T, delayMs = 1500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delayMs);
  });
};

export function useSubmitConsultation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ConsultationInput) => mockApiCall(data),
    onSuccess: () => {
      toast({
        title: "Request Submitted Successfully",
        description: "One of our education experts will contact you shortly.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: "Please try again later or contact us directly.",
      });
    }
  });
}

