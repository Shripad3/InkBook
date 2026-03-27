import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/client";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: artist } = await adminClient
    .from("artists")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!artist?.stripe_customer_id) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.io";
  const portalParams: Stripe.BillingPortal.SessionCreateParams = {
    customer: artist.stripe_customer_id,
    return_url: `${appUrl}/dashboard/billing`,
  };
  if (process.env.STRIPE_PORTAL_CONFIG_ID) {
    portalParams.configuration = process.env.STRIPE_PORTAL_CONFIG_ID;
  }
  const session = await stripe.billingPortal.sessions.create(portalParams);

  return NextResponse.json({ url: session.url });
}
