import type Stripe from "stripe";
import { adminClient } from "@/lib/supabase/admin";
import { addMinutes, addDays } from "date-fns";
import { parseISO } from "date-fns";

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const bookingId = session.metadata?.booking_id;
  if (!bookingId) return;

  // Fetch booking with related data
  const { data: bookingRaw } = await adminClient
    .from("bookings")
    .select(`
      *,
      artists:artist_id (id, slug, timezone),
      clients:client_id (id, email, first_name)
    `)
    .eq("id", bookingId)
    .single();
  const booking = bookingRaw as unknown as {
    id: string;
    deposit_paid: boolean;
    starts_at: string;
    ends_at: string;
    artists: { id: string; slug: string; timezone: string };
    clients: { id: string; email: string; first_name: string };
  } | null;

  if (!booking || booking.deposit_paid) return;

  // Update booking status
  await adminClient.from("bookings").update({
    deposit_paid: true,
    deposit_payment_intent_id: session.payment_intent as string,
    status: "confirmed",
  }).eq("id", bookingId);

  const startsAt = parseISO(booking.starts_at);
  const endsAt = parseISO(booking.ends_at);

  // Schedule all automated notifications
  const notifications = [
    // 48h before: prep reminder + consent form email
    {
      booking_id: bookingId,
      type: "prep_reminder_48h" as const,
      channel: "email" as const,
      scheduled_for: addMinutes(startsAt, -48 * 60).toISOString(),
    },
    // 24h before: consent SMS reminder
    {
      booking_id: bookingId,
      type: "consent_reminder_24h" as const,
      channel: "sms" as const,
      scheduled_for: addMinutes(startsAt, -24 * 60).toISOString(),
    },
    // 24h before: SMS reminder
    {
      booking_id: bookingId,
      type: "sms_24h" as const,
      channel: "sms" as const,
      scheduled_for: addMinutes(startsAt, -24 * 60 + 1).toISOString(),
    },
    // 3h before: SMS reminder
    {
      booking_id: bookingId,
      type: "sms_3h" as const,
      channel: "sms" as const,
      scheduled_for: addMinutes(startsAt, -3 * 60).toISOString(),
    },
    // After appointment: aftercare email
    {
      booking_id: bookingId,
      type: "aftercare" as const,
      channel: "email" as const,
      scheduled_for: addMinutes(endsAt, 2 * 60).toISOString(),
    },
    // 8 weeks later: healed photo request
    {
      booking_id: bookingId,
      type: "healed_photo_request" as const,
      channel: "email" as const,
      scheduled_for: addDays(startsAt, 56).toISOString(),
    },
  ];

  await adminClient.from("notification_log").insert(notifications);

  // Immediate notifications
  await adminClient.from("notification_log").insert([
    {
      booking_id: bookingId,
      type: "deposit_paid_client",
      channel: "email",
      scheduled_for: new Date().toISOString(),
    },
    {
      booking_id: bookingId,
      type: "deposit_paid_client",
      channel: "sms",
      scheduled_for: new Date().toISOString(),
    },
    {
      booking_id: bookingId,
      type: "deposit_paid_artist",
      channel: "email",
      scheduled_for: new Date().toISOString(),
    },
  ]);
}

export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  const { data: artist } = await adminClient
    .from("artists")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!artist) return;

  const plan = getPlanFromPriceId(subscription.items.data[0]?.price.id);

  const endsAt = subscription.cancel_at_period_end && subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : null;

  await adminClient.from("artists").update({
    subscription_plan: plan,
    subscription_status: subscription.status === "active" ? "active" : "past_due",
    subscription_ends_at: endsAt,
  }).eq("id", artist.id);
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  const { data: artist } = await adminClient
    .from("artists")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .single();

  if (!artist) return;

  await adminClient.from("artists").update({
    subscription_status: "cancelled",
    subscription_plan: null,
    subscription_ends_at: null,
  }).eq("id", artist.id);
}

export async function handleStripeConnectAccountUpdated(
  account: Stripe.Account
) {
  const artistId = account.metadata?.artist_id;
  if (!artistId || !account.details_submitted) return;

  await adminClient.from("artists").update({
    stripe_account_id: account.id,
  }).eq("id", artistId);
}

function getPlanFromPriceId(priceId: string | undefined) {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_SOLO_PRICE_ID) return "solo";
  if (priceId === process.env.STRIPE_STUDIO_PRICE_ID) return "studio";
  if (priceId === process.env.STRIPE_STUDIO_PRO_PRICE_ID) return "studio_pro";
  return null;
}
