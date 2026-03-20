import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { computeAvailableSlots } from "@/lib/availability/calculator";
import { parseISO, startOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artist_id");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD in artist timezone
  const sessionTypeId = searchParams.get("session_type_id");

  if (!artistId || !dateStr || !sessionTypeId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Fetch artist timezone
  const { data: artist } = await adminClient
    .from("artists")
    .select("timezone")
    .eq("id", artistId)
    .single();

  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  // Parse date as start of day in artist timezone → UTC
  const localMidnight = new Date(`${dateStr}T00:00:00`);
  const utcDate = fromZonedTime(localMidnight, artist.timezone);

  // Fetch session type
  const { data: sessionType } = await adminClient
    .from("session_types")
    .select("duration_minutes, buffer_minutes, min_notice_hours, max_advance_days")
    .eq("id", sessionTypeId)
    .eq("artist_id", artistId)
    .single();

  if (!sessionType) return NextResponse.json({ error: "Session type not found" }, { status: 404 });

  // Fetch working hours
  const { data: workingHours } = await adminClient
    .from("working_hours")
    .select("day_of_week, start_time, end_time, is_available")
    .eq("artist_id", artistId);

  // Fetch existing confirmed bookings for this date range
  const dayStart = fromZonedTime(new Date(`${dateStr}T00:00:00`), artist.timezone);
  const dayEnd = fromZonedTime(new Date(`${dateStr}T23:59:59`), artist.timezone);

  const { data: bookings } = await adminClient
    .from("bookings")
    .select("starts_at, ends_at, session_type_id")
    .eq("artist_id", artistId)
    .in("status", ["confirmed", "pending_deposit"])
    .gte("starts_at", dayStart.toISOString())
    .lte("starts_at", dayEnd.toISOString());

  // Fetch blocked times
  const { data: blockedTimes } = await adminClient
    .from("blocked_times")
    .select("starts_at, ends_at")
    .eq("artist_id", artistId)
    .gte("ends_at", dayStart.toISOString())
    .lte("starts_at", dayEnd.toISOString());

  const slots = computeAvailableSlots({
    date: utcDate,
    sessionType,
    workingHours: workingHours ?? [],
    existingBookings: bookings ?? [],
    blockedTimes: blockedTimes ?? [],
    artistTimezone: artist.timezone,
  });

  return NextResponse.json({
    slots: slots.map((s) => ({
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt.toISOString(),
      label: s.label,
    })),
  });
}
