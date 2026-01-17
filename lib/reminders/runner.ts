import { prisma } from "@/lib/db/prisma";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";
import { sendPushNotification } from "@/lib/push/server";
import { sendCreditorReminderEmail } from "@/lib/email/client";
import { createInAppNotification } from "@/lib/notifications/create";
import type { Tab, TabReminderSetting, Participant, Expense, ExpenseSplit, User, PushSubscription, EmailPreference } from "@prisma/client";

const BASE_URL = process.env.APP_BASE_URL || "http://localhost:3000";

type ReminderResults = {
  sent: number;
  skipped: number;
  failed: number;
};

type UserWithRelations = User & {
  pushSubscriptions: PushSubscription[];
  emailPreference: EmailPreference | null;
};

type ExpenseWithSplits = Expense & {
  splits: ExpenseSplit[];
};

type ParticipantWithUser = Participant & {
  user: UserWithRelations;
};

type TabWithRelations = Tab & {
  participants: ParticipantWithUser[];
  expenses: ExpenseWithSplits[];
};

function getDaysSince(enabledAt: Date): number {
  const now = new Date();
  const diffMs = now.getTime() - enabledAt.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export async function processTabReminders(tab: TabWithRelations, setting: TabReminderSetting, results: ReminderResults, force = false) {
  const now = new Date();
  const participants = tab.participants.map((p) => ({ id: p.id }));
  const expenses = tab.expenses;
  const splits = tab.expenses.flatMap((e) => e.splits);

  // Compute nets and settlements to find who owes whom
  const nets = computeNets(participants, expenses, splits);
  const transfers = computeSettlement(nets);

  // Find Pro creditors (participants with positive net balance who are Pro users)
  const creditors = nets
    .filter((n) => n.netCents > 0)
    .map((net) => {
      const participant = tab.participants.find((p) => p.id === net.participantId);
      return participant && participant.user.subscriptionTier === "PRO"
        ? { ...net, participant }
        : null;
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  // For each Pro creditor, send reminders to their debtors
  for (const creditor of creditors) {
    const creditorUser = creditor.participant.user;
    const creditorName = creditorUser.displayName;

    // Find all transfers where this creditor is the recipient
    const debtsToCreditor = transfers.filter((t) => t.toParticipantId === creditor.participantId);

    for (const transfer of debtsToCreditor) {
      // Skip zero-amount transfers
      if (transfer.amountCents <= 0) continue;

      const debtorParticipant = tab.participants.find((p) => p.id === transfer.fromParticipantId);
      if (!debtorParticipant) continue;

      const debtorUser = debtorParticipant.user;
      const debtorEmail = debtorUser.email || debtorUser.guestEmail;

      // Check Cooldown
      if (!force) {
        const lastLog = await prisma.tabReminderLog.findFirst({
          where: {
            tabId: tab.id,
            recipientUserId: debtorUser.id,
            status: "sent",
          },
          orderBy: { sentAt: "desc" },
        });

        if (lastLog) {
          const hoursSinceLast = (now.getTime() - lastLog.sentAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLast < 48) {
            results.skipped++;
            continue;
          }
        }
      }

      // Send
      let channel = "none";
      let status = "failed";
      let failureReason = "No available channel";

      // Try Push
      if (setting.channelPush && debtorUser.pushSubscriptions.length > 0) {
        for (const sub of debtorUser.pushSubscriptions) {
          if (sub.revokedAt) continue;

          const payload = JSON.stringify({
            title: `${creditorName} is waiting on your payment`,
            body: `You owe $${(transfer.amountCents / 100).toFixed(2)} for ${tab.name}. Tap to pay.`,
            url: `/tabs/${tab.id}`,
          });

          const pushResult = await sendPushNotification({
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
          }, payload);

          if (pushResult.success) {
            channel = "push";
            status = "sent";
            break;
          } else {
             if (pushResult.expired) {
                await prisma.pushSubscription.update({
                  where: { id: sub.id },
                  data: { revokedAt: new Date() }
                });
             }
          }
        }
      }

      // Fallback to Email
      if (status !== "sent" && setting.channelEmail && debtorUser.emailPreference?.reminderEmailsEnabled !== false) {
         if (debtorEmail) {
           try {
             await sendCreditorReminderEmail(
               debtorEmail,
               debtorUser.displayName,
               creditorName,
               tab.name,
               transfer.amountCents,
               `${BASE_URL}/tabs/${tab.id}`,
               `${BASE_URL}/unsubscribe?token=${debtorUser.id}`
             );
             channel = "email";
             status = "sent";
           } catch (error) {
             console.error("Failed to send reminder email:", error);
             failureReason = "Email send failed";
           }
         } else {
           failureReason = "No email address available";
         }
      }

      // Always create in-app notification (independent channel)
      try {
        await createInAppNotification(
          debtorUser.id,
          "PAYMENT_REMINDER",
          `${creditorName} is waiting on your payment`,
          `You owe $${(transfer.amountCents / 100).toFixed(2)} for ${tab.name}`,
          `/tabs/${tab.id}`
        );
      } catch (error) {
        console.error("Failed to create in-app notification:", error);
      }

      // Log it
      await prisma.tabReminderLog.create({
        data: {
          tabId: tab.id,
          recipientUserId: debtorUser.id,
          sentByUserId: creditorUser.id,
          channel: channel,
          status: status,
          reason: status === "failed" ? failureReason : undefined,
        },
      });

      if (status === "sent") results.sent++;
      else results.failed++;
    }
  }
}

export async function runReminders() {
  const now = new Date();
  console.log("Running reminders at", now.toISOString());

  const settings = await prisma.tabReminderSetting.findMany({
    where: { enabled: true },
    include: {
      tab: {
        include: {
          participants: {
            include: {
              user: {
                include: {
                  pushSubscriptions: true,
                  emailPreference: true,
                },
              },
            },
          },
          expenses: { include: { splits: true } },
        },
      },
    },
  });

  const results = { sent: 0, skipped: 0, failed: 0 };

  for (const setting of settings) {
    const { tab } = setting;
    if (tab.status !== "ACTIVE") continue;

    // Use enabledAt if available, otherwise fall back to updatedAt
    const referenceDate = setting.enabledAt || setting.updatedAt;
    const daysSince = getDaysSince(referenceDate);
    const schedule: number[] = JSON.parse(setting.scheduleDaysJson);

    // Check if today matches the schedule
    if (!schedule.includes(daysSince)) {
      continue;
    }

    await processTabReminders(tab, setting, results);
  }

  return results;
}