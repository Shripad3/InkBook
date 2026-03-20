"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, CheckCircle2, CreditCard, Lock, Zap } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function StepStripeConnectInner() {
  const store = useOnboardingStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [stripeStatus, setStripeStatus] = useState<"not_started" | "pending" | "connected">("not_started");

  useEffect(() => {
    const stripe = searchParams.get("stripe");
    if (stripe === "success") {
      setStripeStatus("connected");
      store.setStripeConnected(true);
    } else if (stripe === "refresh") {
      toast.info("Stripe onboarding wasn't completed. Please try again.");
    }
  }, [searchParams]);

  async function connectStripe() {
    setLoading(true);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error("Failed to connect Stripe: " + data.error);
    }
  }

  async function completeOnboarding() {
    setCompleting(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("artists")
      .update({ completed_onboarding_at: new Date().toISOString() })
      .eq("id", store.artistId!);

    setCompleting(false);

    if (error) {
      toast.error("Failed to complete setup");
      return;
    }

    toast.success("You're all set! Welcome to InkBook 🎉");
    router.push("/dashboard");
  }

  async function skipForNow() {
    setCompleting(true);
    const supabase = createClient();
    await supabase
      .from("artists")
      .update({ completed_onboarding_at: new Date().toISOString() })
      .eq("id", store.artistId!);
    setCompleting(false);
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connect Stripe to receive payments</CardTitle>
        <CardDescription>
          Clients pay deposits directly to your Stripe account. InkBook charges a small platform fee per booking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {stripeStatus === "connected" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <p className="font-medium text-emerald-400">Stripe connected!</p>
              <p className="text-sm text-muted-foreground">You can now receive deposit payments.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border text-center">
                <CreditCard className="h-5 w-5 text-[#c9a84c]" />
                <p className="text-xs text-muted-foreground">Accept cards & wallets</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border text-center">
                <Lock className="h-5 w-5 text-[#c9a84c]" />
                <p className="text-xs text-muted-foreground">Secure & instant payouts</p>
              </div>
              <div className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border text-center">
                <Zap className="h-5 w-5 text-[#c9a84c]" />
                <p className="text-xs text-muted-foreground">Auto refunds on cancellation</p>
              </div>
            </div>

            <Button
              variant="gold"
              className="w-full"
              onClick={connectStripe}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect Stripe Account"}
            </Button>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => store.setStep(3)}
          >
            ← Back
          </Button>
          {stripeStatus === "connected" ? (
            <Button variant="gold" className="flex-1" onClick={completeOnboarding} disabled={completing}>
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go to Dashboard →"}
            </Button>
          ) : (
            <Button variant="ghost" className="flex-1" onClick={skipForNow} disabled={completing}>
              {completing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skip for now →"}
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          You can connect Stripe later from your dashboard settings.
        </p>
      </CardContent>
    </Card>
  );
}

export function StepStripeConnect() {
  return (
    <Suspense>
      <StepStripeConnectInner />
    </Suspense>
  );
}
