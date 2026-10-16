// src/util/email.ts
import { Resend } from "resend";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
}: SendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(
      `[Email] RESEND_API_KEY not configured. Skipping email to ${Array.isArray(to) ? to.join(", ") : to}: "${subject}"`,
    );
    return {
      success: false,
      error: "RESEND_API_KEY is not configured in environment variables.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const sender =
      from ||
      process.env.EMAIL_FROM ||
      "The MOBB <notifications@mobb.kielbyrne.com>";

    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[Email] Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Unexpected error sending email:", err);
    return { success: false, error: err.message || "Failed to send email." };
  }
}

/**
 * Base email layout matching MOBB brand visual identity.
 */
function wrapEmailTemplate({
  title,
  preheader,
  bodyContent,
}: {
  title: string;
  preheader: string;
  bodyContent: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #070709;
      color: #E2E8F0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 580px;
      margin: 32px auto;
      background: #121217;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 32px 32px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: linear-gradient(180deg, rgba(255, 90, 0, 0.08) 0%, rgba(18, 18, 23, 0) 100%);
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-size: 11px;
      letter-spacing: 2px;
      color: #FF5A00;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      margin: 0;
    }
    .content {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #CBD5E1;
    }
    .card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
    }
    .btn {
      display: inline-block;
      background-color: #FF5A00;
      color: #000000 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 10px;
      margin-top: 16px;
      text-align: center;
    }
    .footer {
      padding: 24px 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748B;
      text-align: center;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <span style="display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </span>
  <div class="container">
    <div class="header">
      <div class="badge">The MOBB // Community</div>
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px;">
        <strong>The Map of Black Businesses (MOBB)</strong><br>
        Digital infrastructure for economic equity designed to serve the diaspora.
      </p>
      <p style="margin: 0;">
        <a href="https://mobb.kielbyrne.com" style="color: #FF5A00; text-decoration: none;">mobb.kielbyrne.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends a welcome email when a user registers.
 */
export async function sendWelcomeEmail({
  email,
  name,
}: {
  email: string;
  name?: string;
}) {
  const displayName = name?.trim() || email.split("@")[0];
  const subject = "Welcome to The MOBB — Map of Black Businesses";
  const preheader = "Welcome to the digital infrastructure for economic equity.";

  const bodyContent = `
    <p>Peace & welcome, <strong>${displayName}</strong>,</p>
    <p>
      Thank you for joining <strong>The MOBB</strong>. The mission is simple: allow consumers to easily locate, patronize, and support Black-owned businesses in their immediate vicinity (or globally), practicing group economics.
    </p>

    <div class="card">
      <h3 style="margin-top: 0; color: #FFFFFF; font-size: 14px;">What you can do with your account:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #94A3B8;">
        <li style="margin-bottom: 8px;"><strong>Discover:</strong> Use radar and near-me discovery to patronize verified businesses in seconds.</li>
        <li style="margin-bottom: 8px;"><strong>Save Favorites:</strong> Bookmark and build your personal directory of Black-owned businesses.</li>
        <li style="margin-bottom: 8px;"><strong>Community Moderation:</strong> Help verify listings and report closed or inaccurate locations to protect directory accuracy.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="https://mobb.kielbyrne.com" class="btn">Explore The Map</a>
    </div>

    <p style="font-size: 13px; color: #94A3B8; margin-top: 24px;">
      <em>"Give your dollar the choice to make a difference... Just MOBB It."</em>
    </p>
  `;

  const html = wrapEmailTemplate({
    title: "Welcome to The MOBB",
    preheader,
    bodyContent,
  });

  const text = `Peace & welcome ${displayName},\n\nThank you for joining The MOBB (Map of Black Businesses). You can now discover, bookmark, and curate Black-owned businesses globally.\n\nExplore now: https://mobb.kielbyrne.com\n\nGive your dollar the choice to make a difference... Just MOBB It.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Sends a login alert email whenever a user logs into their account.
 */
export async function sendLoginNotificationEmail({
  email,
  name,
  ipAddress,
  userAgent,
}: {
  email: string;
  name?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const displayName = name?.trim() || email.split("@")[0];
  const subject = "Security Alert: New Sign-In to The MOBB";
  const preheader = "We detected a new sign-in to your MOBB account.";
  const formattedTime = new Date().toUTCString();

  const bodyContent = `
    <p>Hello <strong>${displayName}</strong>,</p>
    <p>
      We detected a new sign-in to your account on <strong>The MOBB</strong>.
    </p>

    <div class="card">
      <div style="margin-bottom: 10px; font-size: 13px;">
        <span style="color: #64748B; font-weight: bold;">ACCOUNT:</span>
        <span style="color: #FFFFFF; margin-left: 8px;">${email}</span>
      </div>
      <div style="margin-bottom: 10px; font-size: 13px;">
        <span style="color: #64748B; font-weight: bold;">TIME:</span>
        <span style="color: #FFFFFF; margin-left: 8px;">${formattedTime}</span>
      </div>
      <div style="margin-bottom: 10px; font-size: 13px;">
        <span style="color: #64748B; font-weight: bold;">IP ADDRESS:</span>
        <span style="color: #FFFFFF; margin-left: 8px;">${ipAddress || "Unknown location"}</span>
      </div>
      <div style="font-size: 13px;">
        <span style="color: #64748B; font-weight: bold;">CLIENT:</span>
        <span style="color: #FFFFFF; margin-left: 8px;">${userAgent || "Web Browser"}</span>
      </div>
    </div>

    <p style="font-size: 13px; color: #94A3B8;">
      If this was you, you can safely ignore this email. If you did not sign in or suspect unauthorized activity, please sign out and update your credentials immediately.
    </p>
  `;

  const html = wrapEmailTemplate({
    title: "New Sign-In Detected",
    preheader,
    bodyContent,
  });

  const text = `Hello ${displayName},\n\nA new sign-in to your account (${email}) was detected at ${formattedTime}.\nIP Address: ${ipAddress || "Unknown"}\nClient: ${userAgent || "Web Browser"}\n\nIf this was not you, please secure your account immediately.\nhttps://mobb.kielbyrne.com`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
