import { NextRequest, NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders/runner";

export async function POST(req: NextRequest) {
  // Verify Cron secret - REQUIRED for security
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reminder Runner Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
