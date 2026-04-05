import { EmailType, type EmailPayloadMap, type EmailTemplate } from "../emailTypes";
import { buildSignupWelcome }      from "./signupWelcome";
import { buildEmailVerification }  from "./emailVerification";
import { buildPaymentSuccess }     from "./paymentSuccess";
import { buildPaymentFailed }      from "./paymentFailed";
import { buildExpiryReminder }     from "./expiryReminder";
import { buildPlanExpired }        from "./planExpired";
import { buildUsageLimitReached }  from "./usageLimitReached";
import { buildRenewalPush }        from "./renewalPush";
import { buildReEngagement }        from "./reEngagement";
import { buildEmailVerifiedConfirm } from "./emailVerifiedConfirm";
import { buildAdminNotification }   from "./adminNotification";

/**
 * Central template registry.
 * Maps every EmailType to its builder function.
 * Adding a new email type: add the type to emailTypes.ts, create a builder file, register it here.
 */
export const templateRegistry: {
  [K in EmailType]: (payload: EmailPayloadMap[K]) => EmailTemplate;
} = {
  [EmailType.SIGNUP_WELCOME]:      buildSignupWelcome,
  [EmailType.EMAIL_VERIFICATION]:  buildEmailVerification,
  [EmailType.PAYMENT_SUCCESS]:     buildPaymentSuccess,
  [EmailType.PAYMENT_FAILED]:      buildPaymentFailed,
  [EmailType.EXPIRY_REMINDER_5D]:  (p) => buildExpiryReminder({ ...p, daysLeft: 5 }),
  [EmailType.EXPIRY_REMINDER_3D]:  (p) => buildExpiryReminder({ ...p, daysLeft: 3 }),
  [EmailType.EXPIRY_REMINDER_1D]:  (p) => buildExpiryReminder({ ...p, daysLeft: 1 }),
  [EmailType.PLAN_EXPIRED]:        buildPlanExpired,
  [EmailType.USAGE_LIMIT_REACHED]: buildUsageLimitReached,
  [EmailType.RENEWAL_PUSH]:        buildRenewalPush,
  [EmailType.RE_ENGAGEMENT]:       buildReEngagement,
  [EmailType.EMAIL_VERIFIED]:      buildEmailVerifiedConfirm,
  [EmailType.ADMIN_NOTIFICATION]:  buildAdminNotification,
};
