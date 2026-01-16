import { prisma } from "@/lib/db/prisma";
import { computeNets } from "@/lib/settlement/computeSettlement";
import { sendPushNotification } from "@/lib/push/server";
import { sendReminderEmail } from "@/lib/email/client";
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

  const nets = computeNets(participants, expenses, splits);
  const debtors = nets.filter((n) => n.netCents < 0);

  for (const debtorNet of debtors) {
    const participant = tab.participants.find((p) => p.id === debtorNet.participantId);
    if (!participant) continue;
    const user = participant.user;

    // Check Cooldown
    if (!force) {
      const lastLog = await prisma.tabReminderLog.findFirst({
        where: {
          tabId: tab.id,
          recipientUserId: user.id,
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
    
    // Try Push
    if (setting.channelPush && user.pushSubscriptions.length > 0) {
      for (const sub of user.pushSubscriptions) {
        if (sub.revokedAt) continue;
        
        const payload = JSON.stringify({
          title: `Settle up for ${tab.name}`,
          body: `You owe $${Math.abs(debtorNet.netCents / 100).toFixed(2)}. Tap to pay.`,
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
    if (status !== "sent" && setting.channelEmail && user.emailPreference?.reminderEmailsEnabled !== false) {
       if (user.email) {
         await sendReminderEmail(
           user.email,
           user.displayName,
           tab.name,
           `${BASE_URL}/tabs/${tab.id}`,
           `${BASE_URL}/unsubscribe?token=${user.id}`
         );
         channel = "email";
         status = "sent";
       }
    }

    // Log it
    await prisma.tabReminderLog.create({
      data: {
        tabId: tab.id,
        recipientUserId: user.id,
        channel: channel === "none" ? "email" : channel,
        status: status,
        reason: status === "failed" ? "No available channel or error" : undefined,
      },
    });

    if (status === "sent") results.sent++;
    else results.failed++;
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

    const daysSince = getDaysSince(setting.enabledAt || setting.updatedAt);
    const schedule: number[] = JSON.parse(setting.scheduleDaysJson);

    if (!schedule.includes(daysSince)) {
      continue;
    }

    await processTabReminders(tab, setting, results);
  }

  return results;
}