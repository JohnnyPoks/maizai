import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }
    return { success: true, data };
  } catch (err) {
    console.error("Resend exception:", err);
    return { success: false, error: err };
  }
}

export async function notifySuperAdminOfAccessRequest(req: {
  fullName: string;
  email: string;
  affiliation: string | null;
  reason: string;
  id: string;
}) {
  const reviewUrl = `${process.env.NEXTAUTH_URL}/access-requests`;
  const subject = `New MaizAI access request from ${req.fullName}`;
  const text = `New access request received.\n\nName:        ${req.fullName}\nEmail:       ${req.email}\nAffiliation: ${req.affiliation ?? "(not provided)"}\nReason:      ${req.reason}\n\nReview at: ${reviewUrl}`;
  const html = `<h2 style="color:#1c3a28;">New MaizAI access request</h2>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td><b>Name</b></td><td style="padding-left:16px;">${escapeHtml(req.fullName)}</td></tr>
  <tr><td><b>Email</b></td><td style="padding-left:16px;">${escapeHtml(req.email)}</td></tr>
  <tr><td><b>Affiliation</b></td><td style="padding-left:16px;">${escapeHtml(req.affiliation ?? "(not provided)")}</td></tr>
</table>
<p><b>Reason:</b></p>
<blockquote style="border-left:3px solid #3d8b5c;padding-left:12px;color:#555;">${escapeHtml(req.reason)}</blockquote>
<p><a href="${reviewUrl}" style="background:#3d8b5c;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Review request</a></p>`;
  return sendEmail({ to: process.env.SUPER_ADMIN_EMAIL!, subject, text, html });
}

export async function notifySuperAdminOfFeedback(fb: {
  type: string;
  message: string;
  email: string | null;
  appVersion: string | null;
  id: string;
}) {
  const reviewUrl = `${process.env.NEXTAUTH_URL}/feedback`;
  const label = fb.type === "SUGGESTION" ? "suggestion" : "bug report";
  const subject = `New MaizAI ${label}`;
  const text = `New ${label} received.\n\nFrom:    ${fb.email ?? "(anonymous)"}\nVersion: ${fb.appVersion ?? "(unknown)"}\n\n${fb.message}\n\nReview at: ${reviewUrl}`;
  const html = `<h2 style="color:#1c3a28;">New MaizAI ${escapeHtml(label)}</h2>
<table style="border-collapse:collapse;margin:16px 0;">
  <tr><td><b>From</b></td><td style="padding-left:16px;">${escapeHtml(fb.email ?? "(anonymous)")}</td></tr>
  <tr><td><b>App version</b></td><td style="padding-left:16px;">${escapeHtml(fb.appVersion ?? "(unknown)")}</td></tr>
</table>
<blockquote style="border-left:3px solid #3d8b5c;padding-left:12px;color:#555;">${escapeHtml(fb.message)}</blockquote>
<p><a href="${reviewUrl}" style="background:#3d8b5c;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">View feedback</a></p>`;
  return sendEmail({ to: process.env.SUPER_ADMIN_EMAIL!, subject, text, html });
}
