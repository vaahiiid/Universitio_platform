import type { EmailSender } from "../services/emailService";

// ─── Email Event Identifiers ──────────────────────────────────────────────────

export const EmailType = {
  SIGNUP_WELCOME:       "SIGNUP_WELCOME",
  EMAIL_VERIFICATION:   "EMAIL_VERIFICATION",
  PAYMENT_SUCCESS:      "PAYMENT_SUCCESS",
  PAYMENT_FAILED:       "PAYMENT_FAILED",
  EXPIRY_REMINDER_5D:   "EXPIRY_REMINDER_5D",
  EXPIRY_REMINDER_3D:   "EXPIRY_REMINDER_3D",
  EXPIRY_REMINDER_1D:   "EXPIRY_REMINDER_1D",
  PLAN_EXPIRED:         "PLAN_EXPIRED",
  USAGE_LIMIT_REACHED:  "USAGE_LIMIT_REACHED",
  RENEWAL_PUSH:         "RENEWAL_PUSH",
  RE_ENGAGEMENT:        "RE_ENGAGEMENT",
  EMAIL_VERIFIED:       "EMAIL_VERIFIED",
  ADMIN_NOTIFICATION:   "ADMIN_NOTIFICATION",
  MENTOR_REPLY:         "MENTOR_REPLY",
} as const;

export type EmailType = (typeof EmailType)[keyof typeof EmailType];

// ─── Payload Interfaces ───────────────────────────────────────────────────────

export interface SignupWelcomePayload {
  firstName: string;
}

export interface EmailVerificationPayload {
  firstName: string;
  verificationLink: string;
  expiryHours?: number;
}

export interface PaymentSuccessPayload {
  firstName: string;
  planName: string;
  amount: string;
  expiresAt: string;
  reference?: string; // Short Stripe session reference shown on receipt
}

export interface PaymentFailedPayload {
  firstName: string;
  planName: string;
  amount: string;
}

export interface ExpiryReminderPayload {
  firstName: string;
  planName: string;
  expiresAt: string;
  daysLeft: 1 | 3 | 5;
}

export interface PlanExpiredPayload {
  firstName: string;
  planName: string;
}

export interface UsageLimitReachedPayload {
  firstName: string;
  planName: string;
  limitDescription: string;
}

export interface RenewalPushPayload {
  firstName: string;
  planName: string;
  expiresAt: string;
}

export interface ReEngagementPayload {
  firstName: string;
}

export interface EmailVerifiedPayload {
  firstName: string;
}

export interface AdminNotificationPayload {
  event: string;
  userName?: string;
  userEmail?: string;
  preview?: string;
  adminLink?: string;
}

export interface MentorReplyPayload {
  firstName: string;
  mentorName?: string;
  messagePreview?: string;
  conversationId?: number;
}

// ─── Payload Map — ties each EmailType to its payload interface ───────────────

export type EmailPayloadMap = {
  [EmailType.SIGNUP_WELCOME]:      SignupWelcomePayload;
  [EmailType.EMAIL_VERIFICATION]:  EmailVerificationPayload;
  [EmailType.PAYMENT_SUCCESS]:     PaymentSuccessPayload;
  [EmailType.PAYMENT_FAILED]:      PaymentFailedPayload;
  [EmailType.EXPIRY_REMINDER_5D]:  ExpiryReminderPayload;
  [EmailType.EXPIRY_REMINDER_3D]:  ExpiryReminderPayload;
  [EmailType.EXPIRY_REMINDER_1D]:  ExpiryReminderPayload;
  [EmailType.PLAN_EXPIRED]:        PlanExpiredPayload;
  [EmailType.USAGE_LIMIT_REACHED]: UsageLimitReachedPayload;
  [EmailType.RENEWAL_PUSH]:        RenewalPushPayload;
  [EmailType.RE_ENGAGEMENT]:       ReEngagementPayload;
  [EmailType.EMAIL_VERIFIED]:      EmailVerifiedPayload;
  [EmailType.ADMIN_NOTIFICATION]:  AdminNotificationPayload;
  [EmailType.MENTOR_REPLY]:        MentorReplyPayload;
};

// ─── Compiled Template — what every builder must return ──────────────────────

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  sender: EmailSender;
}

// ─── Builder function signature ───────────────────────────────────────────────

export type EmailTemplateBuilder<P> = (payload: P) => EmailTemplate;
