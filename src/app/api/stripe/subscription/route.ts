import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";

const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  solo: process.env.STRIPE_SOLO_PRICE_ID,
  studio: process.env.STRIPE_STUDIO_PRICE_ID,
  studio_pro: process.env.STRIPE_STUDIO_PRO_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await req.json();
  const priceId = PLAN_PRICE_IDS[plan];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { data: artist } = await adminClient
    .from("artists")
    .select("id, stripe_customer_id, name")
    .eq("user_id", user.id)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }

  let customerId = artist.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: artist.name ?? undefined,
      metadata: { artist_id: artist.id },
    });
    customerId = customer.id;
    await adminClient.from("artists").update({ stripe_customer_id: customerId }).eq("id", artist.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.io";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?subscribed=true`,
    cancel_url: `${appUrl}/dashboard/billing`,
    metadata: { artist_id: artist.id },
  });

  return NextResponse.json({ url: session.url });
}
