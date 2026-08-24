import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

// Falls back to logging the email to the server console when no SMTP host
// is configured, so the reset flow is fully testable without real
// credentials. Configure SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM
// (e.g. Microsoft 365 or Gmail SMTP) to send for real.
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const client = getTransporter();

  if (!client) {
    console.log(`[dev email] Password reset link for ${to}:\n${resetUrl}`);
    return;
  }

  await client.sendMail({
    from: process.env.SMTP_FROM ?? "Medtronic LABS <no-reply@medtroniclabs.org>",
    to,
    subject: "Reset your Core Traits & Recognition Awards password",
    text: `We received a request to reset your password.\n\nReset it here (valid for 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset your password</a> (valid for 1 hour).</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });
}
