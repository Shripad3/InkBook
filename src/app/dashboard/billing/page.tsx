import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";
import { BillingClient } from "./BillingClient";

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await adminClient
    .from("artists")
    .select("subscription_plan, subscription_status, trial_ends_at, stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (!artist) redirect("/sign-in");

  const now = new Date();
  const trialEnd = new Date(artist.trial_ends_at);
  const trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isTrialing = artist.subscription_status === "trial";

  return (
    <BillingClient
      currentPlan={artist.subscription_plan ?? null}
      subscriptionStatus={artist.subscription_status}
      trialDaysLeft={isTrialing ? trialDaysLeft : null}
      hasStripeCustomer={!!artist.stripe_customer_id}
    />
  );
}
