import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/utils/tokens";
import { formatDate } from "@/lib/utils/date";

type Params = { params: Promise<{ token: string }> };

async function getBooking(bookingId: string) {
  const { data } = await adminClient
    .from("bookings")
    .select(`
      id, starts_at, status,
      clients:client_id (first_name, last_name),
      artists:artist_id (name, timezone),
      session_types:session_type_id (name)
    `)
    .eq("id", bookingId)
    .single();
  return data;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const b = booking as any;
  const tz = b.artists?.timezone ?? "UTC";

  // Check if photos already submitted
  const { data: existing } = await adminClient
    .from("healed_photos")
    .select("id")
    .eq("booking_id", bookingId)
    .limit(1);

  return NextResponse.json({
    clientName: `${b.clients?.first_name} ${b.clients?.last_name}`,
    artistName: b.artists?.name ?? "your artist",
    sessionType: b.session_types?.name,
    date: formatDate(b.starts_at, tz),
    alreadySubmitted: (existing?.length ?? 0) > 0,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const storagePaths: string[] = body.storagePaths ?? [];

  if (!storagePaths.length || storagePaths.length > 5) {
    return NextResponse.json({ error: "Provide between 1 and 5 photo paths." }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const rows = storagePaths.map((path) => ({
    booking_id: bookingId,
    storage_path: path,
  }));

  const { error } = await adminClient.from("healed_photos").insert(rows);
  if (error) {
    console.error("[healed/post] Insert failed:", error);
    return NextResponse.json({ error: "Failed to save photos." }, { status: 500 });
  }

  // Update the booking to record submission
  await adminClient
    .from("bookings")
    .update({ healed_photo_request_sent_at: new Date().toISOString() })
    .eq("id", bookingId);

  return NextResponse.json({ ok: true });
}
