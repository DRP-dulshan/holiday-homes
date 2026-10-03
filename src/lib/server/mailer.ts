import "server-only";
import { site } from "@/config/site";

type Mail = {
  to: string;
  subject: string;
  /** Plain-text body; an HTML version is derived from it. */
  text: string;
  replyTo?: string;
};

/** Where team notifications go. */
export const teamInbox = () => process.env.NOTIFY_EMAIL?.trim() || site.email;

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function toHtml(text: string) {
  const body = escapeHtml(text)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#e56a37">$1</a>')
    .replace(/\n/g, "<br>");
  return `<div style="font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.6;color:#2e2e2e;max-width:560px">
<p style="font-size:18px;font-weight:600;margin:0 0 16px">${escapeHtml(site.name)}</p>
${body}
<hr style="border:none;border-top:1px solid #eaeaea;margin:24px 0">
<p style="font-size:12px;color:#808080">${escapeHtml(site.address.full)} · ${escapeHtml(site.phoneDisplay)}</p>
</div>`;
}

/**
 * Sends an email through Resend (https://resend.com) when RESEND_API_KEY and
 * MAIL_FROM are set. Without them the message is logged to the server
 * console, so every flow still works end-to-end in development.
 * Never throws — a failed email must not fail a booking.
 */
export async function sendMail(mail: Mail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.MAIL_FROM?.trim();

  if (!apiKey || !from) {
    console.info(
      `[mail:not-configured] to=${mail.to} subject="${mail.subject}"\n${mail.text}\n`,
    );
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [mail.to],
        subject: mail.subject,
        text: mail.text,
        html: toHtml(mail.text),
        reply_to: mail.replyTo,
      }),
    });
    if (!res.ok) {
      console.error(`[mail] send failed (${res.status}): ${await res.text()}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[mail] send failed:", err);
    return false;
  }
}

/** Absolute site URL for links in emails. */
export function absoluteUrl(path: string) {
  const base = (process.env.SITE_URL?.trim() || site.url).replace(/\/$/, "");
  return `${base}${path}`;
}
