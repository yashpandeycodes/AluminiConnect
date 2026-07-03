import nodemailer from 'nodemailer';

const smtpConfigured = !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

const transporter = smtpConfigured ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

export async function sendVerificationEmail(to: string, verificationLink: string) {
  const subject = "Verify your AlumniConnect Email";
  const html = `
    <h1>Welcome to AlumniConnect!</h1>
    <p>Please verify your email by clicking the link below:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  if (!transporter) {
    console.warn(`[Mock Email] To: ${to}`);
    console.warn(`[Mock Email] Subject: ${subject}`);
    console.warn(`[Mock Email] Verification Link: ${verificationLink}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"AlumniConnect" <noreply@aluminiconnect.edu>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Failed to send email", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}
