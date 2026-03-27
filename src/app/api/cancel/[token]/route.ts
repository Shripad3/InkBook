import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";
import { verifyToken } from "@/lib/utils/tokens";
import { formatDate, formatTime } from "@/lib/utils/date";

const REFUND_WINDOW_HOURS = 48;

function isRefundEligible(startsAt: string): boolean {
  const hoursUntil = (new Date(startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
  return hoursUntil > REFUND_WINDOW_HOURS;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Link is invalid or has expired" }, { status: 410 });
  }

  const { data: bookingData } = await adminClient
    .from("bookings")
    .select(`
      id, status, starts_at, deposit_paid, deposit_amount,
      artists:artist_id (name, timezone),
      clients:client_id (first_name),
      session_types:session_type_id (name)
    `)
    .eq("id", bookingId)
    .single();

  type Row = {
    id: string;
    status: string;
    starts_at: string;
    deposit_paid: boolean;
    deposit_amount: number;
    artists: { name: string | null; timezone: string };
    clients: { first_name: string };
    session_types: { name: string };
  };
  const b = bookingData as unknown as Row | null;
  if (!b) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (b.status === "cancelled_client" || b.status === "cancelled_artist") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 409 });
  }

  if (!["pending_deposit", "confirmed"].includes(b.status)) {
    return NextResponse.json({ error: "Booking cannot be cancelled" }, { status: 409 });
  }

  const tz = b.artists.timezone;

  return NextResponse.json({
    booking: {
      id: b.id,
      sessionType: b.session_types.name,
      artistName: b.artists.name ?? "your artist",
      clientFirstName: b.clients.first_name,
      date: formatDate(b.starts_at, tz),
      time: formatTime(b.starts_at, tz),
      depositPaid: b.deposit_paid,
      depositAmount: b.deposit_amount,
      refundEligible: b.deposit_paid && isRefundEligible(b.starts_at),
    },
  });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Link is invalid or has expired" }, { status: 410 });
  }

  const { data: bookingData } = await adminClient
    .from("bookings")
    .select("id, status, starts_at, deposit_paid, deposit_payment_intent_id")
    .eq("id", bookingId)
    .single();

  if (!bookingData) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  const b = bookingData as {
    id: string;
    status: string;
    starts_at: string;
    deposit_paid: boolean;
    deposit_payment_intent_id: string | null;
  };

  if (b.status === "cancelled_client" || b.status === "cancelled_artist") {
    return NextResponse.json({ error: "Booking is already cancelled" }, { status: 409 });
  }

  if (!["pending_deposit", "confirmed"].includes(b.status)) {
    return NextResponse.json({ error: "Booking cannot be cancelled" }, { status: 409 });
  }

  let refunded = false;
  if (b.deposit_paid && b.deposit_payment_intent_id && isRefundEligible(b.starts_at)) {
    await stripe.refunds.create({
      payment_intent: b.deposit_payment_intent_id,
      reverse_transfer: true,
      refund_application_fee: true,
    });
    refunded = true;
  }

  await adminClient
    .from("bookings")
    .update({ status: "cancelled_client" })
    .eq("id", b.id);

  return NextResponse.json({ refunded });
}
