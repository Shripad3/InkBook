import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { adminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ""
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      await adminClient
        .from("bookings")
        .update({ status: "confirmed", deposit_paid: true })
        .eq("id", bookingId);

      // Schedule deposit_paid notification
      await adminClient.from("notification_log").insert({
        booking_id: bookingId,
        type: "deposit_paid",
        channel: "email",
        status: "pending",
      });
    }
  }

  return NextResponse.json({ received: true });
}
