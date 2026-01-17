import { ServerClient } from "postmark";

const token = process.env.POSTMARK_SERVER_TOKEN;
const fromEmail = process.env.EMAIL_FROM;

export const emailClient = token ? new ServerClient(token) : null;

/**
 * Escapes HTML special characters to prevent XSS vulnerabilities
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * @deprecated Use sendCreditorReminderEmail or sendPaymentPendingEmail instead
 */
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

  const escapedUserName = escapeHtml(userName);
  const escapedTabName = escapeHtml(tabName);

  await emailClient.sendEmail({
    From: fromEmail,
    To: to,
    Subject: `Reminder: Settle up for "${escapedTabName}"`,
    HtmlBody: `
      <p>Hi ${escapedUserName},</p>
      <p>This is a friendly reminder to settle your share for the tab <strong>${escapedTabName}</strong>.</p>
      <p>
        <a href="${tabUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Tab</a>
      </p>
      <p style="font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Unsubscribe from reminders</a>
      </p>
    `,
    TextBody: `Hi ${escapedUserName}, please settle up for "${escapedTabName}": ${tabUrl}`,
  });
}

export async function sendCreditorReminderEmail(
  to: string,
  debtorName: string,
  creditorName: string,
  tabName: string,
  amountCents: number,
  tabUrl: string,
  unsubscribeUrl: string
): Promise<void> {
  if (!emailClient || !fromEmail) {
    console.warn("Email client not configured, skipping email.");
    return;
  }

  const amountDollars = (amountCents / 100).toFixed(2);
  const escapedDebtorName = escapeHtml(debtorName);
  const escapedCreditorName = escapeHtml(creditorName);
  const escapedTabName = escapeHtml(tabName);

  await emailClient.sendEmail({
    From: fromEmail,
    To: to,
    Subject: `${escapedCreditorName} is waiting on your payment for "${escapedTabName}"`,
    HtmlBody: `
      <p>Hi ${escapedDebtorName},</p>
      <p><strong>${escapedCreditorName}</strong> is waiting on your payment of <strong>$${amountDollars}</strong> for the tab <strong>"${escapedTabName}"</strong>.</p>
      <p>Please settle up as soon as possible.</p>
      <p>
        <a href="${tabUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Settle Up</a>
      </p>
      <p style="font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Unsubscribe from reminders</a>
      </p>
    `,
    TextBody: `Hi ${escapedDebtorName}, ${escapedCreditorName} is waiting on your payment of $${amountDollars} for "${escapedTabName}": ${tabUrl}`,
  });
}

export async function sendPaymentPendingEmail(
  to: string,
  payeeName: string,
  payerName: string,
  tabName: string,
  amountCents: number,
  settlementUrl: string,
  unsubscribeUrl: string
): Promise<void> {
  if (!emailClient || !fromEmail) {
    console.warn("Email client not configured, skipping email.");
    return;
  }

  const amountDollars = (amountCents / 100).toFixed(2);
  const escapedPayeeName = escapeHtml(payeeName);
  const escapedPayerName = escapeHtml(payerName);
  const escapedTabName = escapeHtml(tabName);

  await emailClient.sendEmail({
    From: fromEmail,
    To: to,
    Subject: `${escapedPayerName} says they've paid you for "${escapedTabName}"`,
    HtmlBody: `
      <p>Hi ${escapedPayeeName},</p>
      <p><strong>${escapedPayerName}</strong> says they've paid you <strong>$${amountDollars}</strong> for the tab <strong>"${escapedTabName}"</strong>.</p>
      <p>Please confirm that you received this payment.</p>
      <p>
        <a href="${settlementUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Payment</a>
      </p>
      <p style="font-size: 12px; color: #666;">
        <a href="${unsubscribeUrl}">Unsubscribe from notifications</a>
      </p>
    `,
    TextBody: `Hi ${escapedPayeeName}, ${escapedPayerName} says they've paid you $${amountDollars} for "${escapedTabName}": ${settlementUrl}`,
  });
}
