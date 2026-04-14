import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const getFromAddress = () =>
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const renderInviteEmail = ({
  workspaceName,
  inviterName,
  inviteLink,
  role,
}) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin-bottom: 12px;">You're invited to join ${workspaceName}</h2>
    <p style="margin-bottom: 12px;">Hi there,</p>
    <p style="margin-bottom: 16px;">
      ${inviterName} has invited you to join the <strong>${workspaceName}</strong> workspace on Planexa as a <strong>${role}</strong>.
    </p>
    <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 16px 0; background-color: #f9fafb;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Workspace</p>
      <p style="margin: 0; font-size: 18px; font-weight: 700;">${workspaceName}</p>
      <p style="margin: 8px 0 0; font-size: 14px; color: #4b5563;">Role: ${role}</p>
    </div>
    <a href="${inviteLink}" style="display: inline-block; padding: 12px 18px; cursor:pointer; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Accept Invitation</a>
    <p style="margin-top: 16px; margin-bottom: 8px;">This invitation link expires in 7 days.</p>
    <p style="font-size: 13px; color: #6b7280;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="font-size: 13px; color: #6b7280; word-break: break-all;">
      ${inviteLink}
    </p>
  </div>
`;

export const sendWorkspaceInviteEmail = async ({
  email,
  workspaceName,
  inviterName,
  inviteLink,
  role,
}) => {
  if (!resend || !email) return;

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `You're invited to join ${workspaceName} on Planexa`,
    html: renderInviteEmail({
      workspaceName,
      inviterName,
      inviteLink,
      role: role.toLowerCase(),
    }),
  });
};
