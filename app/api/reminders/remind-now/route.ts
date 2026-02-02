import { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { requirePro } from "@/lib/auth/entitlements";
import { processTabReminders } from "@/lib/reminders/runner";
import { ok, error as apiError } from "@/lib/api/response";

const { auth: getSession } = NextAuth(authConfig);

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return apiError(401, "unauthorized", "Authentication required");
  }

  // Check Pro
  const isPro = await requirePro(session.user.id);
  if (!isPro) {
    return apiError(403, "pro_required", "Pro subscription required");
  }

  const { tabId } = await req.json();

  if (!tabId) {
    return apiError(400, "validation_error", "Missing tabId");
  }

  // Get Tab & Settings
  const setting = await prisma.tabReminderSetting.findUnique({
    where: { tabId },
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

  if (!setting) {
    return apiError(404, "not_found", "Reminders not enabled for this tab");
  }

  const results = { sent: 0, skipped: 0, failed: 0 };

  // Force run (override schedule, but processTabReminders respects cooldown unless forced)
  // MD says "rate-limited". Let's allow processTabReminders to handle cooldown.
  // If we want "Remind Now" to bypass cooldown, we pass force=true.
  // MD: "Cooldown: no more than 1 reminder per recipient per 48 hours"
  // Does "Remind Now" override this? Usually yes, but maybe with a stricter limit (e.g. 1 manual per day).
  // Let's pass force=false to respect the global 48h cooldown for now to be safe.
  // If the user clicks it and it says "Skipped (recently sent)", that's better than spam.

  await processTabReminders(setting.tab, setting, results, false);

  return ok({ results });
}
