import "server-only";

import { Resend } from "resend";

import { formatNumber, formatOrdinal } from "@/lib/format";
import { site } from "@/lib/site";

export type ConfirmationEmailInput = {
  to: string;
  position: number;
  referralUrl: string;
  unsubscribeUrl: string;
};

type EmailResult =
  | { sent: true; id: string | null }
  | { sent: false; reason: "not_configured" | "provider_error" };

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(input: ConfirmationEmailInput): string {
  const position = escapeHtml(formatOrdinal(input.position));
  const referralUrl = escapeHtml(input.referralUrl);
  const unsubscribeUrl = escapeHtml(input.unsubscribeUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>You're on the Keepflow list</title>
  </head>
  <body style="margin:0;padding:0;background:#f8faff;color:#05070d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're ${position} in line. Your private referral link is inside.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8faff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #dbe4f5;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 0;">
                <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1;letter-spacing:-1px;color:#05070d;">keepflow</div>
              </td>
            </tr>
            <tr>
              <td style="padding:38px 32px 0;">
                <p style="margin:0 0 14px;font-size:12px;line-height:1.4;letter-spacing:.08em;text-transform:uppercase;color:#46536b;">You're on the list</p>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:40px;line-height:1.02;letter-spacing:-1.4px;font-weight:400;color:#05070d;">You're ${position} in line.</h1>
                <p style="margin:20px 0 0;font-size:16px;line-height:1.65;color:#3a4558;">Thank you for making room for Keepflow. We'll write once, when it's your turn.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ff;border-radius:8px;">
                  <tr>
                    <td style="padding:20px 22px;">
                      <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#1c4df5;"><strong>Move up the list</strong></p>
                      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a4558;">Share your private link. Every friend who joins with it moves you closer to the front. Three referrals unlocks priority onboarding.</p>
                      <a href="${referralUrl}" style="display:inline-block;background:#05070d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 18px;border-radius:999px;">Open my referral link</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 32px 34px;">
                <p style="margin:0;font-size:12px;line-height:1.65;color:#6b788e;">You received this because you joined the Keepflow waitlist at keepflow.app. No newsletter, no drip campaign. <a href="${unsubscribeUrl}" style="color:#3a4558;text-decoration:underline;">Unsubscribe</a>.</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:11px;line-height:1.5;color:#7a879c;">Keepflow · A quiet personal agent · ${escapeHtml(site.launch)}</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildPlainText(input: ConfirmationEmailInput): string {
  return `You're ${formatOrdinal(input.position)} in line for Keepflow.

Thank you for making room for Keepflow. We'll write once, when it's your turn.

Move up the list:
Share your private link. Every friend who joins with it moves you closer to the front. Three referrals unlocks priority onboarding.

${input.referralUrl}

You received this because you joined the Keepflow waitlist at keepflow.app. No newsletter, no drip campaign.
Unsubscribe: ${input.unsubscribeUrl}

Keepflow · ${site.launch}
`;
}

export async function sendConfirmationEmail(
  input: ConfirmationEmailInput,
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: input.to,
      subject: `You're ${formatNumber(input.position)} in line for Keepflow`,
      html: buildHtml(input),
      text: buildPlainText(input),
      headers: {
        "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
      },
    });

    if (error) {
      console.error("[waitlist] confirmation email rejected", {
        name: error.name,
      });
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true, id: data?.id ?? null };
  } catch (error) {
    console.error("[waitlist] confirmation email failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { sent: false, reason: "provider_error" };
  }
}
