/**
 * Shared HTML shell for all AskiMate transactional emails.
 *
 * Brand hierarchy:
 *   Universitio  = trusted parent brand, shown prominently in the header
 *   AskiMate     = smart study companion, technology product by Universitio
 *
 * Call buildEmailHtml(heading, bodyHtml) to produce the full email HTML.
 * Call buildEmailText(heading, bodyText) to produce a plain-text fallback.
 */

export function buildEmailHtml(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
             background:#f4f4f7;padding:32px 0;margin:0">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:0 16px">

      <table width="580" cellpadding="0" cellspacing="0" role="presentation"
             style="background:#ffffff;border-radius:10px;overflow:hidden;
                    max-width:580px;box-shadow:0 2px 8px rgba(0,0,0,0.07)">

        <!-- ── HEADER ─────────────────────────────────────────────────── -->
        <tr>
          <td style="background:#42147d;padding:28px 36px 24px">
            <!-- Universitio — primary brand -->
            <div style="color:#ffffff;font-size:24px;font-weight:800;
                        letter-spacing:-0.8px;line-height:1">UNIVERSITIO</div>
            <!-- AskiMate — sub-brand / product line -->
            <div style="margin-top:6px">
              <span style="display:inline-block;background:rgba(255,255,255,0.12);
                           border-radius:4px;padding:3px 10px">
                <span style="color:#d8caf0;font-size:12px;font-weight:600;
                             letter-spacing:0.6px;text-transform:uppercase">
                  AskiMate
                </span>
                <span style="color:#a98fd4;font-size:12px;margin-left:4px">
                  — your smart study companion
                </span>
              </span>
            </div>
          </td>
        </tr>

        <!-- ── BODY ───────────────────────────────────────────────────── -->
        <tr>
          <td style="padding:36px 36px 28px">
            <h2 style="margin:0 0 18px;color:#1a1a1a;font-size:21px;
                       font-weight:700;line-height:1.3">${heading}</h2>
            <div style="color:#444;font-size:15px;line-height:1.7">${bodyHtml}</div>
          </td>
        </tr>

        <!-- ── FOOTER ─────────────────────────────────────────────────── -->
        <tr>
          <td style="background:#f9f8fc;padding:20px 36px;
                     border-top:1px solid #ede8f5">
            <p style="margin:0 0 6px;color:#7c6fa0;font-size:12px;line-height:1.5">
              AskiMate is a technology product by Universitio.
            </p>
            <p style="margin:0;color:#b0a8c4;font-size:11px;line-height:1.5">
              Universitio Ltd &bull; Company No. 15168670 &bull;
              <a href="https://universitio.com"
                 style="color:#7c6fa0;text-decoration:none">universitio.com</a>
            </p>
          </td>
        </tr>

      </table>

      <!-- spacing below card -->
      <div style="height:32px"></div>

    </td></tr>
  </table>
</body>
</html>`.trim();
}

export function buildEmailText(heading: string, bodyText: string): string {
  return `${heading}\n\n${bodyText}\n\n— AskiMate by Universitio\nhttps://universitio.com\n\nAskiMate is a technology product by Universitio Ltd (Co. No. 15168670).`;
}

/** Strips HTML tags from a string to produce plain-text fallbacks from HTML body strings. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s{2,}/g, " ").trim();
}
