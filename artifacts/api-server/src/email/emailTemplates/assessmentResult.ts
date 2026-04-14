import type { EmailTemplate, EmailTemplateBuilder, AssessmentResultPayload } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

function getBandContext(score: number): { label: string; message: string; colour: string } {
  if (score >= 90) return {
    label: "Strong Potential",
    message: "Your profile shows excellent admission readiness. With the right guidance and a well-prepared application, you are in a strong position to secure offers from competitive UK universities.",
    colour: "#16a34a",
  };
  if (score >= 75) return {
    label: "Good Potential",
    message: "Your profile is competitive and shows genuine potential. A well-structured application and professional support could significantly strengthen your chances.",
    colour: "#059669",
  };
  if (score >= 60) return {
    label: "Moderate Potential",
    message: "Your profile has real potential, but there are areas where additional preparation could make a meaningful difference. A consultation will help us identify the best path forward.",
    colour: "#d97706",
  };
  if (score >= 40) return {
    label: "Developing Profile",
    message: "Your profile is developing. There are specific areas we can work on together to improve your admission readiness and increase your chances of a successful application.",
    colour: "#ea580c",
  };
  return {
    label: "Early Stage",
    message: "Your profile may need some strengthening before applying. Our team can guide you through the key steps to improve your eligibility and build a competitive application.",
    colour: "#dc2626",
  };
}

export const buildAssessmentResult: EmailTemplateBuilder<AssessmentResultPayload> = (payload) => {
  const heading = `Your assessment result from Universitio`;
  const { label, message, colour } = getBandContext(payload.score);

  const bodyHtml = `
    <p>Hi ${payload.firstName},</p>
    <p>Thank you for completing the Universitio assessment. Here is a summary of your result.</p>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#f9f8fc;border-radius:8px;margin:24px 0;overflow:hidden;
                  border:1px solid #ede8f5">
      <tr>
        <td style="padding:20px 24px">
          <div style="font-size:12px;font-weight:600;color:#7c6fa0;
                      text-transform:uppercase;letter-spacing:0.6px;margin-bottom:8px">
            Your Result
          </div>
          <div style="font-size:28px;font-weight:800;color:${colour};line-height:1;
                      margin-bottom:6px">
            ${payload.score}<span style="font-size:16px;font-weight:600;color:#999"> / 100</span>
          </div>
          <div style="display:inline-block;background:${colour};color:#fff;font-size:13px;
                      font-weight:700;padding:4px 14px;border-radius:20px;margin-top:4px">
            ${label}
          </div>
        </td>
      </tr>
    </table>

    <p>${message}</p>

    <p style="margin-top:8px;color:#555">
      Based on your assessment, we strongly recommend booking a free consultation so we can review your case properly and guide you toward the best next step.
    </p>

    <p style="margin-top:28px">
      <a href="https://universitio.com/free-consultation"
         style="background:#42147d;color:#ffffff;padding:13px 28px;border-radius:7px;
                text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
        Book a Free Consultation
      </a>
    </p>

    <p style="color:#888;font-size:13px;margin-top:28px;line-height:1.6">
      Our consultants are available to help you understand your options and build the strongest possible application. Reply to this email if you have any questions.
    </p>
  `.trim();

  const bodyText = [
    `Hi ${payload.firstName},`,
    ``,
    `Thank you for completing the Universitio assessment. Here is your result:`,
    ``,
    `Score: ${payload.score}/100 — ${label}`,
    ``,
    message,
    ``,
    `We strongly recommend booking a free consultation so we can review your case and guide you toward the best next step.`,
    ``,
    `Book here: https://universitio.com/free-consultation`,
    ``,
    `Reply to this email if you have any questions.`,
  ].join("\n");

  return {
    subject: `Your assessment result from Universitio`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "info",
  } satisfies EmailTemplate;
};
