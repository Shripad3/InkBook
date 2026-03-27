"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const PLANS: Array<{
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: readonly string[];
  highlighted?: boolean;
}> = [
  {
    id: "solo",
    name: "Solo",
    price: "€29",
    period: "/month",
    description: "For independent artists",
    features: [
      "Up to 50 bookings/month",
      "Online deposit collection",
      "SMS & email reminders",
      "Consent form management",
      "Healed photo requests",
      "Client database",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: "€59",
    period: "/month",
    description: "For small studios",
    features: [
      "Unlimited bookings",
      "Everything in Solo",
      "Multi-artist support",
      "Studio dashboard",
      "Commission tracking",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "studio_pro",
    name: "Studio Pro",
    price: "€89",
    period: "/month",
    description: "For large studios",
    features: [
      "Everything in Studio",
      "Custom domain booking page",
      "Advanced analytics",
      "Bulk SMS campaigns",
      "API access",
      "Dedicated account manager",
    ],
  },
] as const;

type Plan = "solo" | "studio" | "studio_pro" | null;

interface Props {
  currentPlan: Plan;
  subscriptionStatus: string;
  trialDaysLeft: number | null;
  hasStripeCustomer: boolean;
  subscriptionEndsAt: string | null;
}

export function BillingClient({ currentPlan, subscriptionStatus, trialDaysLeft, hasStripeCustomer, subscriptionEndsAt }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Failed to start checkout");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Could not open billing portal");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  const cancelDate = subscriptionEndsAt
    ? new Date(subscriptionEndsAt).toLocaleDateString("en-IE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const statusLabel: Record<string, string> = {
    trial: `Trial — ${trialDaysLeft ?? 0} day${trialDaysLeft !== 1 ? "s" : ""} left`,
    active: cancelDate ? `Active · Cancels ${cancelDate}` : "Active",
    past_due: "Past due",
    cancelled: "Cancelled",
    paused: "Paused",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing</h1>
          <p className="text-[#71717a] mt-1">
            Status:{" "}
            <span className={subscriptionStatus === "active" ? "text-green-400" : subscriptionStatus === "past_due" ? "text-red-400" : "text-yellow-400"}>
              {statusLabel[subscriptionStatus] ?? subscriptionStatus}
            </span>
            {currentPlan && (
              <span className="text-[#a1a1aa]"> · {PLANS.find((p) => p.id === currentPlan)?.name} plan</span>
            )}
          </p>
        </div>
        {hasStripeCustomer && (
          <Button
            variant="outline"
            onClick={handlePortal}
            disabled={loading === "portal"}
            className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {loading === "portal" ? "Opening..." : "Manage billing"}
          </Button>
        )}
      </div>

      <Separator className="bg-[#2a2a2a]" />

      {cancelDate && (
        <div className="rounded-md border border-yellow-800 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-400">
          Your subscription is active until{" "}
          <span className="font-semibold">{cancelDate}</span>. After that, your
          account will be downgraded and new bookings will be paused.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isHighlighted = plan.highlighted;

          return (
            <Card
              key={plan.id}
              className={`relative bg-[#1a1a1a] ${isHighlighted ? "border-[#c9a84c]" : "border-[#2a2a2a]"}`}
            >
              {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#c9a84c] text-black text-xs font-semibold px-3">Most popular</Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{plan.name}</CardTitle>
                  {isCurrent && <Badge className="bg-green-900 text-green-400 border-green-800">Current</Badge>}
                </div>
                <p className="text-[#71717a] text-sm">{plan.description}</p>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-[#71717a]">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                      <Check className="w-4 h-4 text-[#c9a84c] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => isCurrent ? handlePortal() : handleUpgrade(plan.id)}
                  disabled={!!loading}
                  className={
                    isCurrent
                      ? "w-full border border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#2a2a2a] bg-transparent"
                      : isHighlighted
                      ? "w-full bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold"
                      : "w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
                  }
                >
                  {loading === plan.id
                    ? "Loading..."
                    : isCurrent
                    ? "Manage"
                    : currentPlan
                    ? "Switch plan"
                    : "Get started"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-center text-[#52525b] text-sm">
        All plans include a 14-day free trial. No credit card required to start.
      </p>
    </div>
  );
}
