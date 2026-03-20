import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft } from "lucide-react";

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    price: "€29",
    period: "/month",
    description: "For independent tattoo artists",
    features: [
      "Up to 50 confirmed bookings/month",
      "Public booking page (your own URL)",
      "Online deposit collection via Stripe",
      "Automated SMS reminders (24h + 3h)",
      "Automated email reminders",
      "Digital consent forms + PDF storage",
      "Healed photo requests (8-week auto)",
      "Client database with no-show tracking",
      "Aftercare email sent automatically",
      "Dashboard with calendar + stats",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    price: "€59",
    period: "/month",
    description: "For small studios with multiple artists",
    highlighted: true,
    features: [
      "Everything in Solo",
      "Unlimited bookings",
      "Multi-artist support (up to 5 artists)",
      "Studio overview dashboard",
      "Commission tracking + reporting",
      "Invite artists by email",
      "Aggregate calendar view",
      "Priority support",
    ],
  },
  {
    id: "studio_pro",
    name: "Studio Pro",
    price: "€89",
    period: "/month",
    description: "For established studios at scale",
    features: [
      "Everything in Studio",
      "Unlimited artists",
      "Advanced analytics & revenue reports",
      "Custom domain for booking page",
      "Bulk SMS campaigns to client list",
      "API access",
      "Dedicated account manager",
      "White-label email branding",
    ],
  },
];

const FAQ = [
  {
    q: "Is there a free trial?",
    a: "Yes — every new account gets a 14-day free trial with full access to Solo features. No credit card required.",
  },
  {
    q: "What happens when I exceed 50 bookings on Solo?",
    a: "New bookings will be paused until your next month resets. We'll notify you before you hit the limit so you can upgrade in time.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your billing page at any time. You keep access until the end of your billing period.",
  },
  {
    q: "How does the Stripe deposit work?",
    a: "Deposits go directly to your connected Stripe account. InkBook charges a 2% platform fee per transaction.",
  },
  {
    q: "Do my clients need an InkBook account?",
    a: "No. Clients book, pay, and sign consent forms without creating an account.",
  },
  {
    q: "Is there a setup fee?",
    a: "None. Sign up, complete onboarding (10 minutes), and your booking page is live.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link href="/" className="text-[#c9a84c] font-bold text-xl">InkBook</Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-[#a1a1aa] hover:text-white text-sm transition-colors">Sign in</Link>
          <Button asChild className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold text-sm h-9 px-4">
            <Link href="/sign-up">Start free trial</Link>
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold">Simple, honest pricing</h1>
          <p className="text-[#a1a1aa] text-xl max-w-xl mx-auto">
            Start free. Pay only when you&apos;re ready. No contracts, no hidden fees.
          </p>
          <p className="text-[#52525b] text-sm">+ 2% per deposit transaction (Stripe fees separate)</p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative bg-[#1a1a1a] ${plan.highlighted ? "border-[#c9a84c]" : "border-[#2a2a2a]"}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#c9a84c] text-black text-xs font-semibold px-3">Most popular</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">{plan.name}</CardTitle>
                <p className="text-[#71717a] text-sm">{plan.description}</p>
                <div className="mt-3">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-[#71717a]">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Button
                  asChild
                  className={
                    plan.highlighted
                      ? "w-full bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold"
                      : "w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white"
                  }
                >
                  <Link href="/sign-up">Start free trial</Link>
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#a1a1aa]">
                      <Check className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
          <div className="space-y-6">
            {FAQ.map((item) => (
              <div key={item.q}>
                <h3 className="text-white font-semibold mb-2">{item.q}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Still unsure? Start free.</h2>
          <p className="text-[#71717a]">
            14 days, no card, full access. You&apos;ll know in the first week.
          </p>
          <Button asChild size="lg" className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold px-10">
            <Link href="/sign-up">Create your free account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
