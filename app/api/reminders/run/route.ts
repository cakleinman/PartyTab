import { NextRequest } from "next/server";
import { runReminders } from "@/lib/reminders/runner";
import { ok, error as apiError } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  // Verify Cron secret - REQUIRED for security
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return apiError(500, "internal_error", "Server misconfigured");
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError(401, "unauthorized", "Unauthorized");
  }

  try {
    const result = await runReminders();
    return ok(result);
  } catch (err) {
    console.error("Reminder Runner Error:", err);
    return apiError(500, "internal_error", "Internal Server Error");
  }
}
