"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Clock, User, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils/currency";

type BookingInfo = {
  id: string;
  sessionType: string;
  artistName: string;
  clientFirstName: string;
  date: string;
  time: string;
  depositPaid: boolean;
  depositAmount: number;
  refundEligible: boolean;
};

type PageState =
  | { stage: "loading" }
  | { stage: "error"; message: string }
  | { stage: "ready"; booking: BookingInfo }
  | { stage: "confirming"; booking: BookingInfo }
  | { stage: "done"; refunded: boolean };

export default function CancelPage() {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<PageState>({ stage: "loading" });

  useEffect(() => {
    fetch(`/api/cancel/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setState({ stage: "error", message: data.error });
        } else {
          setState({ stage: "ready", booking: data.booking });
        }
      })
      .catch(() => setState({ stage: "error", message: "Something went wrong. Please try again." }));
  }, [token]);

  async function handleCancel() {
    if (state.stage !== "confirming") return;
    const res = await fetch(`/api/cancel/${token}`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setState({ stage: "done", refunded: data.refunded });
    } else {
      setState({ stage: "error", message: data.error ?? "Failed to cancel. Please contact the artist directly." });
    }
  }

  if (state.stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (state.stage === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto" />
            <p className="font-medium text-white">{state.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.stage === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-semibold text-white">Booking cancelled</p>
              {state.refunded ? (
                <p className="text-muted-foreground text-sm mt-1">
                  Your deposit has been refunded. It may take 5–10 business days to appear on your statement.
                </p>
              ) : (
                <p className="text-muted-foreground text-sm mt-1">
                  Your booking has been cancelled. As per the cancellation policy, your deposit is non-refundable within 48 hours of the appointment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const booking = state.stage === "ready" || state.stage === "confirming" ? state.booking : null;
  if (!booking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cancel booking</CardTitle>
            <CardDescription>
              Hi {booking.clientFirstName}, here are the details for the booking you&apos;re cancelling.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{booking.sessionType} with {booking.artistName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{booking.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{booking.time}</span>
              </div>
            </div>

            <div className={`rounded-md px-4 py-3 text-sm flex items-start gap-3 ${
              booking.refundEligible
                ? "bg-green-950/30 border border-green-800 text-green-400"
                : "bg-yellow-950/30 border border-yellow-800 text-yellow-400"
            }`}>
              {booking.refundEligible ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>
                {booking.refundEligible
                  ? `Your deposit of ${formatCurrency(booking.depositAmount)} will be refunded.`
                  : booking.depositPaid
                  ? `Your deposit of ${formatCurrency(booking.depositAmount)} is non-refundable — the appointment is within 48 hours.`
                  : "No deposit was charged for this booking."}
              </span>
            </div>

            {state.stage === "ready" && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setState({ stage: "confirming", booking })}
              >
                Cancel my booking
              </Button>
            )}

            {state.stage === "confirming" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setState({ stage: "ready", booking })}
                  >
                    Keep booking
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    Yes, cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by <a href="https://inkbook.io" className="text-[#c9a84c] hover:underline">InkBook</a>
        </p>
      </div>
    </div>
  );
}
