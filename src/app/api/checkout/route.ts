import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { adminClient } from "@/lib/supabase/admin";

const PLATFORM_FEE_PERCENT = 2; // 2% platform fee

export async function POST(request: Request) {
  const { bookingId } = await request.json();

  if (!bookingId) return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });

  // Fetch booking with artist and client
  const { data: bookingData } = await adminClient
    .from("bookings")
    .select(`
      *,
      artists:artist_id (
        id, name, slug, stripe_account_id, stripe_customer_id
      ),
      clients:client_id (
        email, first_name, last_name
      ),
      session_types:session_type_id (
        name
      )
    `)
    .eq("id", bookingId)
    .single();

  type BookingRow = {
    deposit_paid: boolean;
    deposit_amount: number;
    artists: { id: string; name: string | null; slug: string; stripe_account_id: string | null };
    clients: { email: string; first_name: string; last_name: string };
    session_types: { name: string };
  };
  const b = bookingData as unknown as BookingRow | null;
  if (!b) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (b.deposit_paid) return NextResponse.json({ error: "Deposit already paid" }, { status: 400 });

  const artist = b.artists;
  const client = b.clients;
  const sessionType = b.session_types;

  if (!artist.stripe_account_id) {
    return NextResponse.json(
      { error: "Artist hasn't connected Stripe yet" },
      { status: 400 }
    );
  }

  const depositInCents = Math.round(b.deposit_amount * 100);
  const platformFeeInCents = Math.round((depositInCents * PLATFORM_FEE_PERCENT) / 100);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: client.email,
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: {
            name: `Deposit — ${sessionType.name} with ${artist.name}`,
            description: `Tattoo appointment deposit. Booking ref: ${bookingId.slice(0, 8).toUpperCase()}`,
          },
          unit_amount: depositInCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeInCents,
      transfer_data: {
        destination: artist.stripe_account_id,
      },
    },
    metadata: {
      booking_id: bookingId,
      artist_id: artist.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${artist.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/book/${artist.slug}/confirm?booking_id=${bookingId}`,
  });

  return NextResponse.json({ url: session.url });
}
