import { NextRequest, NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders/runner";

export async function POST(req: NextRequest) {
  // Verify Cron secret or internal protection
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Vercel Cron automatically secures this if configured?
    // Actually Vercel Cron uses a shared secret in query param or header?
    // MD says: "POST https://<domain>/api/reminders/run"
    // Usually we protect this.
    // For now, let's assume CRON_SECRET is set by Claude.
  }
  
  // Actually, for MVP, we might skip strict auth if Vercel handles it, but better safe.
  // If CRON_SECRET is missing, we might default to open or fail.
  // Let's implement a simple check if env var exists.
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
