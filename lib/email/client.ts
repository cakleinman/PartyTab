import { ServerClient } from "postmark";

const token = process.env.POSTMARK_SERVER_TOKEN;
const fromEmail = process.env.EMAIL_FROM;

export const emailClient = token ? new ServerClient(token) : null;

export async function sendReminderEmail(
  to: string,
  userName: string,
  tabName: string,
  tabUrl: string,
  unsubscribeUrl: string
) {
  if (!emailClient || !fromEmail) {
    console.warn("Email client not configured, skipping email.");
    return;
  }

  await emailClient.sendEmail({
    From: fromEmail,
    To: to,
    Subject: `Reminder: Settle up for "${tabName}"`,
    HtmlBody: `
      <p>Hi ${userName},</p>
      <p>This is a friendly reminder to settle your share for the tab <strong>${tabName}</strong>.</p>
      <p>
        <a href="${tabUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Tab</a>
      </p>
      <p style="font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Unsubscribe from reminders</a>
      </p>
    `,
    TextBody: `Hi ${userName}, please settle up for "${tabName}": ${tabUrl}`,
  });
}
