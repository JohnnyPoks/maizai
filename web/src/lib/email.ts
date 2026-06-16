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

export async function notifyRequesterReceived(req: { fullName: string; email: string }) {
  const subject = "We have received your MaizAI access request";
  const text = `Hello ${req.fullName},\n\nThank you for requesting access to the MaizAI dashboard. We will review your request and notify you at this email address when a decision has been made.\n\nThe MaizAI team`;
  const html = `<p>Hello <b>${escapeHtml(req.fullName)}</b>,</p>
<p>Thank you for requesting access to the MaizAI dashboard. We will review your request and notify you at this email address when a decision has been made.</p>
<p style="color:#6b7280;font-size:13px;">The MaizAI team</p>`;
  return sendEmail({ to: req.email, subject, text, html });
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

export async function notifyRequesterApproved(req: {
  fullName: string;
  email: string;
  tempPassword: string;
}) {
  const signInUrl = `${process.env.NEXTAUTH_URL}/sign-in`;
  const subject = "Your MaizAI access request has been approved";
  const text = `Hello ${req.fullName},\n\nYour MaizAI access request has been approved.\n\nSign in at ${signInUrl} with:\nE-mail: ${req.email}\nTemporary password: ${req.tempPassword}\n\nYou will be prompted to set a new password after signing in.\n\nThe MaizAI team`;
  const html = `<p>Hello <b>${escapeHtml(req.fullName)}</b>,</p>
<p>Your MaizAI access request has been <b style="color:#3d8b5c;">approved</b>.</p>
<p>Sign in at <a href="${signInUrl}">${signInUrl}</a> with:</p>
<table style="border-collapse:collapse;margin:12px 0;background:#f0f9f2;border-radius:6px;padding:12px;">
  <tr><td><b>E-mail</b></td><td style="padding-left:16px;font-family:monospace;">${escapeHtml(req.email)}</td></tr>
  <tr><td><b>Temporary password</b></td><td style="padding-left:16px;font-family:monospace;">${escapeHtml(req.tempPassword)}</td></tr>
</table>
<p style="color:#6b7280;font-size:13px;">You will be prompted to set a new password after signing in.</p>
<p><a href="${signInUrl}" style="background:#3d8b5c;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;">Sign in now</a></p>
<p style="color:#6b7280;font-size:13px;">The MaizAI team</p>`;
  return sendEmail({ to: req.email, subject, text, html });
}

export async function notifyRequesterDenied(req: {
  fullName: string;
  email: string;
  notes?: string | null;
}) {
  const subject = "Your MaizAI access request has been reviewed";
  const reasonLine = req.notes ? `\nReason: ${req.notes}` : "";
  const text = `Hello ${req.fullName},\n\nAfter review, we are unable to approve your MaizAI dashboard access request at this time.${reasonLine}\n\nYou may submit a new request if your circumstances change.\n\nThe MaizAI team`;
  const reasonHtml = req.notes
    ? `<p><b>Reason:</b> ${escapeHtml(req.notes)}</p>`
    : "";
  const html = `<p>Hello <b>${escapeHtml(req.fullName)}</b>,</p>
<p>After review, we are unable to approve your MaizAI dashboard access request at this time.</p>
${reasonHtml}
<p>You may submit a new request if your circumstances change.</p>
<p style="color:#6b7280;font-size:13px;">The MaizAI team</p>`;
  return sendEmail({ to: req.email, subject, text, html });
}
