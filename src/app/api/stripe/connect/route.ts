import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe/client";
import { adminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: artist } = await supabase.from("artists").select("*").single();
  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  let accountId = artist.stripe_account_id;

  // Create Express account if not already created
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "IE",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { artist_id: artist.id },
    });
    accountId = account.id;
    await adminClient
      .from("artists")
      .update({ stripe_account_id: accountId })
      .eq("id", artist.id);
  }

  // Create onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/profile?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings/profile?stripe=success`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
