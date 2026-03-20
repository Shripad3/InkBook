import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2, Calendar, MessageSquare, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">You&apos;re booked!</h1>
        <p className="text-muted-foreground mb-8">
          Your deposit has been received and your appointment is confirmed.
          We&apos;ve sent a confirmation to your email.
        </p>

        <div className="text-left space-y-4 mb-8">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Before your appointment
          </h2>
          <div className="space-y-3">
            {[
              {
                icon: <Droplets className="h-4 w-4 text-[#c9a84c]" />,
                text: "Stay hydrated in the days before — it makes the process easier",
              },
              {
                icon: <Calendar className="h-4 w-4 text-[#c9a84c]" />,
                text: "Eat a good meal before your appointment — low blood sugar makes it harder",
              },
              {
                icon: <MessageSquare className="h-4 w-4 text-[#c9a84c]" />,
                text: "Wear or bring loose clothing that gives access to the area being tattooed",
              },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
                <div className="shrink-0 mt-0.5">{tip.icon}</div>
                <p className="text-sm text-muted-foreground">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-6">
          You&apos;ll receive a consent form 48 hours before your appointment.
          Please complete it before arriving.
        </p>

        <Button variant="outline" asChild>
          <Link href="/">Back to InkBook</Link>
        </Button>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
