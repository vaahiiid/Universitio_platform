import type { EmailTemplate, EmailTemplateBuilder, AssessmentResultPayload, AssessmentDestinationResult } from "../emailTypes";
import { buildUniversitioEmailHtml, buildUniversitioEmailText } from "./_base";

/**
 * Band thresholds and colours MUST exactly match the frontend UI:
 *   >= 90  → Top Shape         (#15803d green-700)
 *   >= 70  → Strong Potential  (#16a34a green-500)
 *   >= 50  → On the Right Track (#d97706 amber-600)
 *   < 50   → Needs a Boost     (#dc2626 red-500)
 */
interface BandContext {
  colour: string;
  summary: string;
}

function getBandContext(score: number): BandContext {
  if (score >= 90) return {
    colour: "#15803d",
    summary: "Excellent admission readiness — your profile is in a strong position for competitive programmes.",
  };
  if (score >= 70) return {
    colour: "#16a34a",
    summary: "Good potential for admission — a well-structured application could secure strong offers.",
  };
  if (score >= 50) return {
    colour: "#d97706",
    summary: "You are on the right track — targeted preparation in a few areas could meaningfully improve your chances.",
  };
  return {
    colour: "#dc2626",
    summary: "Your profile could benefit from strengthening before applying — our consultants can guide you through the key steps.",
  };
}

const DEST_LABELS: Record<string, string> = {
  UK: "United Kingdom",
  USA: "United States",
  Canada: "Canada",
  Australia: "Australia",
  Germany: "Germany",
  Netherlands: "Netherlands",
};

function destLabel(destination: string): string {
  return DEST_LABELS[destination] || destination;
}

function buildResultRowHtml(r: AssessmentDestinationResult): string {
  const { colour, summary } = getBandContext(r.score);
  const observationHtml = (r.observations && r.observations.length > 0)
    ? `<ul style="margin:10px 0 0 0;padding-left:18px;color:#555;font-size:14px;line-height:1.7">
        ${r.observations.map((o) => `<li>${o}</li>`).join("")}
      </ul>`
    : "";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#f9f8fc;border-radius:8px;margin:16px 0;overflow:hidden;
                  border:1px solid #ede8f5">
      <tr>
        <td style="padding:18px 22px">
          <div style="font-size:12px;font-weight:700;color:#42147d;text-transform:uppercase;
                      letter-spacing:0.6px;margin-bottom:10px">
            ${destLabel(r.destination)}
          </div>
          <div>
            <span style="font-size:30px;font-weight:800;color:${colour};line-height:1">
              ${r.score}
            </span><span style="font-size:16px;font-weight:600;color:#999"> / 100</span>
            &nbsp;&nbsp;
            <span style="display:inline-block;background:${colour};color:#fff;font-size:12px;
                         font-weight:700;padding:4px 13px;border-radius:20px;
                         vertical-align:middle">
              ${r.band}
            </span>
          </div>
          <p style="margin:10px 0 0 0;font-size:14px;color:#555;line-height:1.6">${summary}</p>
          ${observationHtml}
        </td>
      </tr>
    </table>
  `.trim();
}

function buildResultRowText(r: AssessmentDestinationResult): string {
  const { summary } = getBandContext(r.score);
  const lines = [
    `  ${destLabel(r.destination)}: ${r.score} / 100 — ${r.band}`,
    `  ${summary}`,
  ];
  if (r.observations && r.observations.length > 0) {
    for (const obs of r.observations) {
      lines.push(`  • ${obs}`);
    }
  }
  return lines.join("\n");
}

export const buildAssessmentResult: EmailTemplateBuilder<AssessmentResultPayload> = (payload) => {
  const heading = `Your assessment results from Universitio`;
  const { results, firstName } = payload;
  const isMulti = results.length > 1;

  const bodyHtml = `
    <p>Hi ${firstName},</p>
    <p>Thank you for completing the Universitio assessment. Below ${isMulti ? "are your results for each selected destination" : "is your result"}.</p>

    ${results.map(buildResultRowHtml).join("\n")}

    <p style="margin-top:20px;color:#555">
      Based on your results, we strongly recommend booking a free consultation so we can review your profile in detail and guide you toward the best next step.
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
    `Hi ${firstName},`,
    ``,
    `Thank you for completing the Universitio assessment. Here ${isMulti ? "are your results for each selected destination" : "is your result"}:`,
    ``,
    ...results.map(buildResultRowText).flatMap((s) => [s, ""]),
    `Based on your results, we strongly recommend booking a free consultation so we can review your profile in detail.`,
    ``,
    `Book here: https://universitio.com/free-consultation`,
    ``,
    `Reply to this email if you have any questions.`,
  ].join("\n");

  return {
    subject: `Your assessment results from Universitio`,
    html: buildUniversitioEmailHtml(heading, bodyHtml),
    text: buildUniversitioEmailText(heading, bodyText),
    sender: "universitio-info",
  } satisfies EmailTemplate;
};
