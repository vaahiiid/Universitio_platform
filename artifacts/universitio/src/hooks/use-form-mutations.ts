import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Mock schemas for validation
export const consultationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(5, "Phone number is required"),
  country: z.string().min(2, "Country is required"),
  destination: z.string().min(2, "Destination is required"),
  studyInterest: z.string().min(2, "Study interest is required"),
  startDate: z.string().min(2, "Start date is required"),
  message: z.string().optional(),
});

export const assessmentSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  educationLevel: z.string().min(2, "Education level is required"),
  budget: z.string().min(2, "Budget range is required"),
  timeline: z.string().min(2, "Timeline is required"),
});

type ConsultationInput = z.infer<typeof consultationSchema>;
type AssessmentInput = z.infer<typeof assessmentSchema>;

// Simulates an API call with latency
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

export function useSubmitAssessment() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: AssessmentInput) => mockApiCall(data),
    onSuccess: () => {
      toast({
        title: "Assessment Received",
        description: "Thank you for sharing your details. We will review them and reach out.",
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
