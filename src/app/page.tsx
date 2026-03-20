import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  CreditCard,
  MessageSquare,
  FileSignature,
  Camera,
  Shield,
  ArrowRight,
  Star,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Smart booking page",
    description: "Your own public booking URL. Clients pick their session type, date, and time — no back-and-forth.",
  },
  {
    icon: CreditCard,
    title: "Deposit collection",
    description: "Stripe-powered deposits paid upfront. Protects your time and filters out no-shows automatically.",
  },
  {
    icon: MessageSquare,
    title: "Automated reminders",
    description: "SMS and email reminders sent 24h and 3h before. Clients show up prepared — every time.",
  },
  {
    icon: FileSignature,
    title: "Digital consent forms",
    description: "Clients sign before they arrive. PDF stored automatically. No clipboards, no paper.",
  },
  {
    icon: Camera,
    title: "Healed photo requests",
    description: "Automatically asks clients for healed photos 8 weeks after their session. Build your portfolio passively.",
  },
  {
    icon: Shield,
    title: "No-show protection",
    description: "Repeat no-shows flagged automatically. InkBook requires a higher deposit from them next time.",
  },
];

const TESTIMONIALS = [
  {
    name: "Ciarán M.",
    handle: "@ciaraninks",
    text: "I used to lose 3–4 hours a week to DM scheduling. InkBook cut that to zero. The deposit thing alone paid for itself in the first week.",
  },
  {
    name: "Sofia R.",
    handle: "@sofiafineline",
    text: "My clients actually show up prepared now. The reminders and consent form link make such a difference. Love it.",
  },
  {
    name: "Dave K.",
    handle: "@davekustomtattoo",
    text: "Running a 4-artist studio was chaos before this. Now I have one dashboard for everything and split commission automatically.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a] px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-[#c9a84c] font-bold text-xl">InkBook</span>
        <div className="flex items-center gap-4">
          <Link href="/pricing" className="text-[#a1a1aa] hover:text-white text-sm transition-colors">
            Pricing
          </Link>
          <Link href="/sign-in" className="text-[#a1a1aa] hover:text-white text-sm transition-colors">
            Sign in
          </Link>
          <Button asChild className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold text-sm h-9 px-4">
            <Link href="/sign-up">Start free trial</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <Badge className="bg-[#1a1a1a] text-[#c9a84c] border-[#2a2a2a] mb-6">
          Built for tattoo artists
        </Badge>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Stop booking tattoos
          <br />
          <span className="text-[#c9a84c]">through DMs.</span>
        </h1>
        <p className="text-[#a1a1aa] text-xl max-w-2xl mx-auto mb-10">
          InkBook gives you a professional booking page, automated deposits, client reminders,
          and consent forms — so you can focus on tattooing, not admin.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button asChild size="lg" className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold px-8">
            <Link href="/sign-up">
              Start your free trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-[#2a2a2a] text-[#a1a1aa] hover:bg-[#1a1a1a] hover:text-white">
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>
        <p className="text-[#52525b] text-sm mt-4">14-day free trial · No credit card required</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">Everything you need, nothing you don&apos;t</h2>
        <p className="text-[#71717a] text-center mb-12 max-w-xl mx-auto">
          InkBook is purpose-built for tattoo artists. Not adapted from a generic salon app.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors">
              <CardContent className="pt-6 space-y-3">
                <feature.icon className="w-8 h-8 text-[#c9a84c]" />
                <h3 className="font-semibold text-white">{feature.title}</h3>
                <p className="text-[#71717a] text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Up and running in 10 minutes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Create your profile", desc: "Add your session types, pricing, and working hours." },
            { step: "2", title: "Share your booking link", desc: "Send clients to book.inkbook.io/your-name — that's it." },
            { step: "3", title: "Get paid while you sleep", desc: "Clients pay deposits and sign consent forms before they arrive." },
          ].map((item) => (
            <div key={item.step} className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#c9a84c] text-black font-bold text-lg flex items-center justify-center mx-auto">
                {item.step}
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="text-[#71717a] text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Artists love it</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.handle} className="bg-[#1a1a1a] border-[#2a2a2a]">
              <CardContent className="pt-6 space-y-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#c9a84c] fill-[#c9a84c]" />
                  ))}
                </div>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-white font-medium text-sm">{t.name}</p>
                  <p className="text-[#52525b] text-xs">{t.handle}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to fill your books?</h2>
        <p className="text-[#a1a1aa] mb-8">
          Join artists who&apos;ve stopped losing money to no-shows and admin chaos.
        </p>
        <Button asChild size="lg" className="bg-[#c9a84c] hover:bg-[#b8973b] text-black font-bold px-10">
          <Link href="/sign-up">
            Start free — 14 days on us
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8 max-w-6xl mx-auto flex items-center justify-between text-[#52525b] text-sm">
        <span className="text-[#c9a84c] font-bold">InkBook</span>
        <div className="flex gap-6">
          <Link href="/pricing" className="hover:text-[#a1a1aa] transition-colors">Pricing</Link>
          <Link href="/sign-in" className="hover:text-[#a1a1aa] transition-colors">Sign in</Link>
          <Link href="/sign-up" className="hover:text-[#a1a1aa] transition-colors">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
