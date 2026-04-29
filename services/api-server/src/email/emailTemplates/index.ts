import { EmailType, type EmailPayloadMap, type EmailTemplate } from "../emailTypes";
import { buildSignupWelcome }              from "./signupWelcome";
import { buildEmailVerification }          from "./emailVerification";
import { buildPaymentSuccess }             from "./paymentSuccess";
import { buildPaymentFailed }              from "./paymentFailed";
import { buildExpiryReminder }             from "./expiryReminder";
import { buildPlanExpired }                from "./planExpired";
import { buildUsageLimitReached }          from "./usageLimitReached";
import { buildRenewalPush }                from "./renewalPush";
import { buildReEngagement }               from "./reEngagement";
import { buildEmailVerifiedConfirm }       from "./emailVerifiedConfirm";
import { buildAdminNotification }          from "./adminNotification";
import { buildMentorReply }                from "./mentorReply";
import { buildConsultationConfirmation }   from "./consultationConfirmation";
import { buildAssessmentResult }           from "./assessmentResult";
import { buildContactConfirmation }        from "./contactConfirmation";
import { buildReferralConfirmation }       from "./referralConfirmation";
import { buildAgentConfirmation }          from "./agentConfirmation";
import { buildServicesConfirmation }       from "./servicesConfirmation";
import { buildPasswordReset }              from "./passwordReset";

/**
 * Central template registry.
 * Maps every EmailType to its builder function.
 * Adding a new email type: add the type to emailTypes.ts, create a builder file, register it here.
 */
export const templateRegistry: {
  [K in EmailType]: (payload: EmailPayloadMap[K]) => EmailTemplate;
} = {
  [EmailType.SIGNUP_WELCOME]:             buildSignupWelcome,
  [EmailType.EMAIL_VERIFICATION]:         buildEmailVerification,
  [EmailType.PAYMENT_SUCCESS]:            buildPaymentSuccess,
  [EmailType.PAYMENT_FAILED]:             buildPaymentFailed,
  [EmailType.EXPIRY_REMINDER_5D]:         (p) => buildExpiryReminder({ ...p, daysLeft: 5 }),
  [EmailType.EXPIRY_REMINDER_3D]:         (p) => buildExpiryReminder({ ...p, daysLeft: 3 }),
  [EmailType.EXPIRY_REMINDER_1D]:         (p) => buildExpiryReminder({ ...p, daysLeft: 1 }),
  [EmailType.PLAN_EXPIRED]:               buildPlanExpired,
  [EmailType.USAGE_LIMIT_REACHED]:        buildUsageLimitReached,
  [EmailType.RENEWAL_PUSH]:               buildRenewalPush,
  [EmailType.RE_ENGAGEMENT]:              buildReEngagement,
  [EmailType.EMAIL_VERIFIED]:             buildEmailVerifiedConfirm,
  [EmailType.ADMIN_NOTIFICATION]:         buildAdminNotification,
  [EmailType.MENTOR_REPLY]:               buildMentorReply,
  [EmailType.CONSULTATION_CONFIRMATION]:  buildConsultationConfirmation,
  [EmailType.ASSESSMENT_RESULT]:          buildAssessmentResult,
  [EmailType.CONTACT_CONFIRMATION]:       buildContactConfirmation,
  [EmailType.REFERRAL_CONFIRMATION]:      buildReferralConfirmation,
  [EmailType.AGENT_CONFIRMATION]:         buildAgentConfirmation,
  [EmailType.SERVICES_CONFIRMATION]:      buildServicesConfirmation,
  [EmailType.PASSWORD_RESET]:             buildPasswordReset,
};
