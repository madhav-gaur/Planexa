import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const sendPasswordResetEmail = async ({ email, name, resetLink }) => {
  if (!resend) {
    throw new Error("Missing RESEND_API_KEY in environment");
  }

  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  await resend.emails.send({
    from,
    to: email,
    subject: "Reset your Planexa password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p style="margin-bottom: 12px;">Hi ${name || "there"},</p>
        <p style="margin-bottom: 16px;">
          We received a request to reset your Planexa password. Use the button below to choose a new password.
        </p>
        <a
          href="${resetLink}"
          style="display: inline-block; padding: 12px 18px; cursor:pointer; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;"
        >
          Reset password
        </a>
        <p style="margin-top: 16px; margin-bottom: 8px;">This link expires in 1 hour.</p>
        <p style="font-size: 13px; color: #6b7280;">
          If you did not request this, you can safely ignore this email.
        </p>
        <p style="font-size: 13px; color: #6b7280;">
          If button doesn't work click given link below.
        </p>
        <p style="font-size: 13px; color: #6b7280; word-break: break-all;">
          ${resetLink}
        </p>
      </div>
    `,
  });
};
