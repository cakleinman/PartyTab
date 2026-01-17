import { prisma } from "@/lib/db/prisma";
import { ok, error as apiError, validationError } from "@/lib/api/response";
import { isApiError, throwApiError } from "@/lib/api/errors";
import { getUserFromSession } from "@/lib/api/guards";
import { parseUuid } from "@/lib/validators/schemas";
import { requirePro } from "@/lib/auth/entitlements";
import { computeNets } from "@/lib/settlement/computeSettlement";
import { sendCreditorReminderEmail } from "@/lib/email/client";
import { createInAppNotification } from "@/lib/notifications/create";
import { NotificationType } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tabId: string }> }
) {
  try {
    const { tabId: rawTabId } = await params;
    const tabId = parseUuid(rawTabId, "tabId");

    // 1. Verify caller is authenticated
    const user = await getUserFromSession();
    if (!user) {
      throwApiError(401, "unauthorized", "Unauthorized");
    }

    // 2. Verify caller is Pro
    const isPro = await requirePro(user.id);
    if (!isPro) {
      throwApiError(403, "pro_required", "Pro subscription required");
    }

    // 3. Get request body
    const body = await request.json();
    const debtorParticipantId = parseUuid(
      body?.debtorParticipantId,
      "debtorParticipantId"
    );

    // 4. Get the tab with participants, expenses, and splits
    const tab = await prisma.tab.findUnique({
      where: { id: tabId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
        expenses: {
          include: {
            splits: true,
          },
        },
      },
    });

    if (!tab) {
      throwApiError(404, "not_found", "Tab not found");
    }

    // 5. Verify caller is a participant in this tab
    const callerParticipant = tab.participants.find(
      (p) => p.userId === user.id
    );
    if (!callerParticipant) {
      throwApiError(403, "not_participant", "Not a participant in this tab");
    }

    // 6. Get the debtor participant
    const debtorParticipant = tab.participants.find(
      (p) => p.id === debtorParticipantId
    );
    if (!debtorParticipant) {
      throwApiError(404, "not_found", "Debtor participant not found");
    }

    // 7. Compute net balances
    const nets = computeNets(
      tab.participants,
      tab.expenses,
      tab.expenses.flatMap((e) => e.splits)
    );

    const callerNet = nets.find((n) => n.participantId === callerParticipant.id);
    const debtorNet = nets.find(
      (n) => n.participantId === debtorParticipant.id
    );

    // 8. Verify caller is OWED money (positive net balance)
    if (!callerNet || callerNet.netCents <= 0) {
      throwApiError(
        403,
        "forbidden",
        "You must be owed money to send reminders"
      );
    }

    // 9. Verify debtor has NEGATIVE net balance
    if (!debtorNet || debtorNet.netCents >= 0) {
      throwApiError(
        403,
        "forbidden",
        "This participant does not owe money"
      );
    }

    // 10. Check rate limit: look for recent manual reminder
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReminder = await prisma.tabReminderLog.findFirst({
      where: {
        manualReminder: true,
        sentByUserId: user.id,
        recipientUserId: debtorParticipant.userId,
        sentAt: {
          gte: oneDayAgo,
        },
      },
    });

    if (recentReminder) {
      throwApiError(
        429,
        "limit_exceeded",
        "You have already sent a reminder to this person in the last 24 hours"
      );
    }

    // 11. Check email preferences and send reminder via email (if debtor has email/guestEmail and hasn't unsubscribed)
    const debtorEmail = debtorParticipant.user.email || debtorParticipant.user.guestEmail;
    const tabUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://partytab.app"}/tabs/${tabId}`;
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://partytab.app"}/settings/notifications`;

    let emailSent = false;
    if (debtorEmail) {
      // Check if debtor has unsubscribed from reminder emails
      const emailPreference = await prisma.emailPreference.findUnique({
        where: { userId: debtorParticipant.userId },
      });

      const reminderEmailsEnabled =
        !emailPreference || emailPreference.reminderEmailsEnabled;

      if (reminderEmailsEnabled) {
        const amountOwed = -debtorNet.netCents;
        await sendCreditorReminderEmail(
          debtorEmail,
          debtorParticipant.user.displayName,
          user.displayName,
          tab.name,
          amountOwed,
          tabUrl,
          unsubscribeUrl
        );
        emailSent = true;
      }
    }

    // 12. Create in-app notification
    await createInAppNotification(
      debtorParticipant.userId,
      NotificationType.PAYMENT_REMINDER,
      `${user.displayName} is waiting on your payment for "${tab.name}"`,
      `You owe ${user.displayName} $${(-debtorNet.netCents / 100).toFixed(2)} for "${tab.name}"`,
      `/tabs/${tabId}`
    );

    // 13. Log to TabReminderLog with manualReminder: true
    await prisma.tabReminderLog.create({
      data: {
        tabId,
        recipientUserId: debtorParticipant.userId,
        channel: emailSent ? "email" : "in_app",
        sentByUserId: user.id,
        manualReminder: true,
        status: "sent",
      },
    });

    return ok({
      success: true,
      message: "Reminder sent successfully",
    });
  } catch (error) {
    if (isApiError(error)) {
      return apiError(error.status, error.code, error.message);
    }
    return validationError(error);
  }
}
