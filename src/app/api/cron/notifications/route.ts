import { NextRequest, NextResponse } from "next/server";
import { processScheduledNotifications } from "@/lib/notifications/scheduler";

export const runtime = "nodejs";
export const maxDuration = 300; // 5 minutes

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processScheduledNotifications();
    console.log(`[cron/notifications] processed=${result.processed} failed=${result.failed}`);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/notifications] Fatal error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
