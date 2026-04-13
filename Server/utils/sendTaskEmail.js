import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const getFromAddress = () =>
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const renderTaskEmail = ({ heading, intro, taskTitle, detailLine, ctaLink, ctaLabel }) => `
  <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1f2937;">
    <h2 style="margin-bottom: 12px;">${heading}</h2>
    <p style="margin-bottom: 12px;">${intro}</p>
    <div style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Task</p>
      <p style="margin: 0; font-size: 18px; font-weight: 700;">${taskTitle}</p>
      <p style="margin: 12px 0 0; font-size: 14px; color: #4b5563;">${detailLine}</p>
    </div>
    ${
      ctaLink
        ? `<a href="${ctaLink}" style="display: inline-block; padding: 12px 18px; cursor:pointer; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">${ctaLabel}</a>`
        : ""
    }
  </div>
`;

export const sendTaskAssignmentEmail = async ({
  email,
  name,
  taskTitle,
  dueDateLabel,
  taskLink,
}) => {
  if (!resend || !email) return;

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `New task assigned: ${taskTitle}`,
    html: renderTaskEmail({
      heading: "You have a new task",
      intro: `Hi ${name || "there"}, a new task has been assigned to you in Planexa.`,
      taskTitle,
      detailLine: dueDateLabel ? `Due: ${dueDateLabel}` : "Open Planexa to view the full task details.",
      ctaLink: taskLink,
      ctaLabel: "Open task",
    }),
  });
};

export const sendTaskOverdueEmail = async ({
  email,
  name,
  taskTitle,
  dueDateLabel,
  taskLink,
}) => {
  if (!resend || !email) return;

  await resend.emails.send({
    from: getFromAddress(),
    to: email,
    subject: `Task overdue: ${taskTitle}`,
    html: renderTaskEmail({
      heading: "Task overdue",
      intro: `Hi ${name || "there"}, this task is now overdue and needs attention.`,
      taskTitle,
      detailLine: `It was due on ${dueDateLabel}.`,
      ctaLink: taskLink,
      ctaLabel: "Review task",
    }),
  });
};
