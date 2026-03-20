import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/utils/tokens";
import { formatDate, formatTime } from "@/lib/utils/date";

type Params = { params: Promise<{ token: string }> };

async function getBooking(bookingId: string) {
  const { data, error } = await adminClient
    .from("bookings")
    .select(`
      id, starts_at, ends_at, placement, size_estimate, medical_notes,
      consent_form_signed_at, consent_form_pdf_url,
      clients:client_id (email, first_name, last_name),
      artists:artist_id (name, timezone),
      session_types:session_type_id (name)
    `)
    .eq("id", bookingId)
    .single();
  if (error) return null;
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
  const clientName = `${b.clients?.first_name} ${b.clients?.last_name}`;

  return NextResponse.json({
    id: b.id,
    clientName,
    clientEmail: b.clients?.email,
    artistName: b.artists?.name,
    sessionType: b.session_types?.name,
    date: formatDate(b.starts_at, tz),
    time: formatTime(b.starts_at, tz),
    placement: b.placement,
    sizeEstimate: b.size_estimate,
    alreadySigned: !!b.consent_form_signed_at,
    signedAt: b.consent_form_signed_at
      ? new Date(b.consent_form_signed_at).toLocaleString("en-IE")
      : null,
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid or expired link." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (!body.signedName) {
    return NextResponse.json({ error: "Signed name is required." }, { status: 400 });
  }

  const booking = await getBooking(bookingId);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const b = booking as any;

  // Verify name matches
  const expectedName = `${b.clients?.first_name} ${b.clients?.last_name}`;
  if (body.signedName.trim().toLowerCase() !== expectedName.toLowerCase()) {
    return NextResponse.json({ error: "Name does not match." }, { status: 400 });
  }

  if (b.consent_form_signed_at) {
    return NextResponse.json({ ok: true, alreadySigned: true });
  }

  const signedAt = new Date().toISOString();

  // Mark as signed — PDF generation happens asynchronously via the PDF route
  await adminClient.from("bookings").update({
    consent_form_signed_at: signedAt,
  }).eq("id", bookingId);

  // Trigger PDF generation in the background
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.io";
  fetch(`${appUrl}/api/consent/${token}/pdf`, {
    method: "POST",
    headers: { "x-internal-secret": process.env.CRON_SECRET ?? "" },
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
