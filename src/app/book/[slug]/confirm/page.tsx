"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { Loader2, CreditCard, Calendar, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BookingDetails {
  id: string;
  starts_at: string;
  deposit_amount: number;
  placement: string | null;
  session_types: { name: string };
  artists: { name: string };
  clients: { first_name: string; last_name: string };
}

function ConfirmPageInner({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      router.push(`/book/${slug}`);
      return;
    }
    fetch(`/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((d) => {
        setBooking(d.booking);
        setLoading(false);
      });
  }, [bookingId, router, slug]);

  async function handlePay() {
    setPaying(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    setPaying(false);

    if (data.url) {
      window.location.href = data.url;
    } else {
      toast.error(data.error ?? "Failed to start payment");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Booking not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Confirm your booking</CardTitle>
            <CardDescription>
              Pay the deposit to secure your appointment slot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{format(new Date(booking.starts_at), "EEEE, MMMM d yyyy")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{format(new Date(booking.starts_at), "h:mm a")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CreditCard className="h-4 w-4 text-[#c9a84c] shrink-0" />
                <span>{booking.session_types.name} with {booking.artists.name}</span>
              </div>
              {booking.placement && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-[#c9a84c] shrink-0" />
                  <span>{booking.placement}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Deposit due today</span>
                <span className="text-xl font-bold text-[#c9a84c]">
                  {formatCurrency(booking.deposit_amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Non-refundable if cancelled within 48 hours of your appointment.
              </p>
            </div>

            <Button
              variant="gold"
              className="w-full h-12 text-base"
              onClick={handlePay}
              disabled={paying}
            >
              {paying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                `Pay Deposit — ${formatCurrency(booking.deposit_amount)}`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Secure payment powered by Stripe. Your slot is held for 15 minutes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConfirmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ConfirmPageInner slug={slug} />
    </Suspense>
  );
}
