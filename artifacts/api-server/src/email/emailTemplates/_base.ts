/**
 * Shared HTML shell for all AskiMate transactional emails.
 * Call buildEmailHtml(heading, bodyHtml) to produce the full email HTML.
 * Call buildEmailText(heading, bodyText) to produce a plain-text fallback.
 */

export function buildEmailHtml(heading: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="font-family:sans-serif;background:#f6f6f6;padding:32px 0;margin:0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0"
             style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:560px">
        <tr>
          <td style="background:#42147d;padding:24px 32px">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px">AskiMate</span>
            <span style="color:#c4b0e8;font-size:13px;margin-left:8px">by Universitio</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 16px;color:#1a1a1a;font-size:20px">${heading}</h2>
            <div style="color:#444;font-size:15px;line-height:1.6">${bodyHtml}</div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eee">
            <p style="margin:0;color:#999;font-size:12px">
              Universitio Ltd &bull; Company No. 15168670 &bull;
              <a href="https://universitio.com" style="color:#42147d;text-decoration:none">universitio.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}

export function buildEmailText(heading: string, bodyText: string): string {
  return `${heading}\n\n${bodyText}\n\n— AskiMate by Universitio\nhttps://universitio.com`;
}

/** Strips HTML tags from a string to produce plain-text fallbacks from HTML body strings. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s{2,}/g, " ").trim();
}
