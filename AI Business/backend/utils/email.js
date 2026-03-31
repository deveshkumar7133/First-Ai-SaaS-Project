import nodemailer from "nodemailer";

const APP_NAME = process.env.APP_NAME || "AI Business";

/**
 * Real SMTP ready: user + password + (Gmail service OR custom host).
 * Gmail launch: set SMTP_SERVICE=gmail + SMTP_USER + SMTP_PASS (App Password) + EMAIL_FROM.
 */
export function isSMTPConfigured() {
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!user || !pass) return false;
  if (process.env.SMTP_SERVICE === "gmail") return true;
  return Boolean(process.env.SMTP_HOST?.trim());
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

let etherealAccountPromise = null;

async function getEtherealAccount() {
  if (!etherealAccountPromise) {
    etherealAccountPromise = nodemailer.createTestAccount();
  }
  return etherealAccountPromise;
}

/**
 * Production / real inbox — Gmail App Password or any SMTP host.
 */
function createSMTPTransport() {
  if (!isSMTPConfigured()) return null;

  if (process.env.SMTP_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim()
      }
    });
  }

  const port = Number(process.env.SMTP_PORT || 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST.trim(),
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user: process.env.SMTP_USER.trim(),
      pass: process.env.SMTP_PASS.trim()
    },
    tls: { rejectUnauthorized: true }
  });
}

/**
 * @returns {Promise<{ transporter: import('nodemailer').Transporter | null; mode: 'smtp' | 'ethereal' | 'console' }>}
 */
async function resolveTransporter() {
  const smtp = createSMTPTransport();
  if (smtp) {
    return { transporter: smtp, mode: "smtp" };
  }

  // Development: fake inbox (no Gmail needed) — OTP + preview URL in terminal
  if (!isProduction()) {
    try {
      const account = await getEtherealAccount();
      return {
        transporter: nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: { user: account.user, pass: account.pass }
        }),
        mode: "ethereal"
      };
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Ethereal test account failed, using console OTP only:", e);
      return { transporter: null, mode: "console" };
    }
  }

  return { transporter: null, mode: "console" };
}

/** Call once on server start when SMTP is configured — confirms Gmail/App credentials work. */
export async function verifySMTPOnStartup() {
  if (!isSMTPConfigured()) return;
  const t = createSMTPTransport();
  if (!t) return;
  try {
    await t.verify();
    // eslint-disable-next-line no-console
    console.log("[email] SMTP OK — OTP emails will go to users’ real inboxes.");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email] SMTP verify failed:", err?.message || err);
    // eslint-disable-next-line no-console
    console.error(
      "[email] Fix SMTP_USER / SMTP_PASS (Gmail needs an App Password, not your normal login password)."
    );
  }
}

function buildBodies(code, purpose = "login") {
  const isSignup = purpose === "signup";
  const line1 = isSignup
    ? `Your ${APP_NAME} signup verification code is: ${code}`
    : `Your ${APP_NAME} login verification code is: ${code}`;
  const ignore = isSignup
    ? "If you did not create an account, you can ignore this email."
    : "If you did not try to log in, you can ignore this email.";

  const text = [line1, "", "This code expires in 10 minutes.", "", ignore].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.5; color: #0f172a;">
  <p>Your <strong>${APP_NAME}</strong> ${isSignup ? "signup " : ""}verification code is:</p>
  <p style="font-size: 28px; letter-spacing: 0.2em; font-weight: 700; margin: 16px 0;">${code}</p>
  <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes.</p>
  <p style="color: #64748b; font-size: 14px;">${ignore}</p>
</body>
</html>`;
  return { text, html };
}

/**
 * @param {{ to: string; code: string; purpose?: 'login' | 'signup' }} params
 * @returns {Promise<{ mode: 'smtp' | 'ethereal' | 'console'; previewUrl?: string }>}
 */
export async function sendLoginVerificationEmail({ to, code, purpose = "login" }) {
  const { text, html } = buildBodies(code, purpose);
  const { transporter, mode } = await resolveTransporter();
  const label = purpose === "signup" ? "signup" : "login";

  if (mode === "console" || !transporter) {
    // eslint-disable-next-line no-console
    console.warn(`[${label} OTP] ${to}: ${code}`);
    return { mode: "console" };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@localhost";

  const info = await transporter.sendMail({
    from: `"${APP_NAME}" <${from}>`,
    to,
    replyTo: from,
    subject:
      purpose === "signup"
        ? `Your ${APP_NAME} signup verification code`
        : `Your ${APP_NAME} login code`,
    text,
    html
  });

  if (mode === "ethereal") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    // eslint-disable-next-line no-console
    console.log(`[dev mail] OTP for ${to}: ${code}`);
    if (previewUrl) {
      // eslint-disable-next-line no-console
      console.log(`[dev mail] Open this link to see the email in browser: ${previewUrl}`);
    }
    return { mode: "ethereal", previewUrl: previewUrl || undefined };
  }

  // eslint-disable-next-line no-console
  console.log(`[email] OTP sent to ${to} (SMTP)`);
  return { mode: "smtp" };
}

function buildResetPasswordBodies({ resetUrl }) {
  const text = [
    `Reset your ${APP_NAME} password`,
    "",
    `Open this link to reset your password (valid for 30 minutes):`,
    resetUrl,
    "",
    "If you did not request this, you can ignore this email."
  ].join("\n");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, -apple-system, Segoe UI, sans-serif; line-height: 1.5; color: #0f172a;">
  <p>Reset your <strong>${APP_NAME}</strong> password</p>
  <p style="margin: 16px 0;">
    <a href="${resetUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 14px;border-radius:12px;text-decoration:none;font-weight:600;">
      Reset password
    </a>
  </p>
  <p style="color:#64748b;font-size:14px;">This link expires in 30 minutes.</p>
  <p style="color:#64748b;font-size:14px;">If you did not request this, you can ignore this email.</p>
  <p style="color:#64748b;font-size:12px;word-break:break-all;">${resetUrl}</p>
</body>
</html>`;
  return { text, html };
}

/**
 * @param {{ to: string; resetUrl: string }} params
 * @returns {Promise<{ mode: 'smtp' | 'ethereal' | 'console'; previewUrl?: string }>}
 */
export async function sendPasswordResetEmail({ to, resetUrl }) {
  const { text, html } = buildResetPasswordBodies({ resetUrl });
  const { transporter, mode } = await resolveTransporter();

  if (mode === "console" || !transporter) {
    // eslint-disable-next-line no-console
    console.warn(`[reset password] ${to}: ${resetUrl}`);
    return { mode: "console" };
  }

  const from =
    process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || "noreply@localhost";

  const info = await transporter.sendMail({
    from: `"${APP_NAME}" <${from}>`,
    to,
    replyTo: from,
    subject: `Reset your ${APP_NAME} password`,
    text,
    html
  });

  if (mode === "ethereal") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    // eslint-disable-next-line no-console
    console.log(`[dev mail] Password reset for ${to}: ${resetUrl}`);
    if (previewUrl) {
      // eslint-disable-next-line no-console
      console.log(`[dev mail] Open this link to see the email in browser: ${previewUrl}`);
    }
    return { mode: "ethereal", previewUrl: previewUrl || undefined };
  }

  // eslint-disable-next-line no-console
  console.log(`[email] Password reset sent to ${to} (SMTP)`);
  return { mode: "smtp" };
}

/**
 * User-facing message after OTP send (login/signup step 1 or resend).
 * @param {{ mode: 'smtp' | 'ethereal' | 'console' }} result
 * @param {{ resend?: boolean; signup?: boolean }} opts
 */
export function loginVerificationUserMessage(result, { resend = false, signup = false } = {}) {
  const finish = signup ? "finish creating your account" : "finish signing in";
  if (result.mode === "smtp") {
    return resend
      ? "A new code was sent to your email."
      : `We sent a 6-digit code to your email. Enter it below to ${finish}.`;
  }
  if (result.mode === "ethereal") {
    return resend
      ? "New code ready — check the backend terminal for the OTP and email preview link."
      : `A test email was sent — check the backend terminal for your 6-digit code (and a link to preview the mail). Enter the code below to ${finish}.`;
  }
  return resend
    ? "Check the server console for your new login code."
    : `Check the server console for your 6-digit code, then enter it below to ${finish}.`;
}
