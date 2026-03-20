"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle } from "lucide-react";

type BookingData = {
  id: string;
  clientName: string;
  clientEmail: string;
  artistName: string;
  sessionType: string;
  date: string;
  time: string;
  placement: string | null;
  sizeEstimate: string | null;
  alreadySigned: boolean;
  signedAt: string | null;
};

const CLAUSES = [
  "I am over 18 years of age and have provided accurate personal information.",
  "I understand that tattooing is permanent. I accept full responsibility for my decision to proceed.",
  "I acknowledge that results may vary depending on skin type, placement, and aftercare.",
  "I am not pregnant, breastfeeding, or under the influence of alcohol or drugs.",
  "I have disclosed all relevant allergies, skin conditions, blood disorders, or medications.",
  "I understand that my deposit is non-refundable if I cancel within 48 hours of my appointment.",
  "I agree to follow all aftercare instructions provided by my artist.",
  "I grant permission for the artist to photograph the completed tattoo for their portfolio (unless I request otherwise in writing).",
  "I release the artist and studio from liability for complications arising from undisclosed medical conditions or failure to follow aftercare advice.",
  "I confirm I have read and understood all of the above and consent freely to proceed.",
];

export default function ConsentPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typedName, setTypedName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/consent/${token}`);
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Invalid or expired link.");
          return;
        }
        const data = await res.json();
        setBooking(data);
      } catch {
        setError("Failed to load consent form.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSign() {
    if (!booking || typedName.trim().toLowerCase() !== booking.clientName.toLowerCase()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/consent/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedName: typedName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to sign. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-[#71717a]">Loading consent form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Link unavailable</p>
            <p className="text-[#71717a] text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) return null;

  if (success || booking.alreadySigned) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-[#1a1a1a] border-[#2a2a2a]">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-white font-semibold mb-2">Consent form signed</p>
            <p className="text-[#71717a] text-sm">
              {booking.alreadySigned && booking.signedAt
                ? `Signed on ${booking.signedAt}.`
                : "Your consent form has been signed and saved."}
            </p>
            <p className="text-[#71717a] text-sm mt-2">
              See you at your appointment with {booking.artistName}!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const nameMatches = typedName.trim().toLowerCase() === booking.clientName.toLowerCase();

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <p className="text-[#c9a84c] font-bold text-xl">InkBook</p>
          <h1 className="text-white text-2xl font-bold mt-1">Tattoo Consent Form</h1>
        </div>

        {/* Appointment details */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white text-base">Your appointment</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[#71717a]">Client</p>
              <p className="text-white font-medium">{booking.clientName}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Artist</p>
              <p className="text-white font-medium">{booking.artistName}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Session type</p>
              <p className="text-white font-medium">{booking.sessionType}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Date &amp; time</p>
              <p className="text-white font-medium">{booking.date} at {booking.time}</p>
            </div>
            {booking.placement && (
              <div>
                <p className="text-[#71717a]">Placement</p>
                <p className="text-white font-medium">{booking.placement}</p>
              </div>
            )}
            {booking.sizeEstimate && (
              <div>
                <p className="text-[#71717a]">Size estimate</p>
                <p className="text-white font-medium">{booking.sizeEstimate}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consent clauses */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white text-base">Consent &amp; declaration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {CLAUSES.map((clause, i) => (
              <div key={i} className="flex gap-3 text-sm text-[#a1a1aa]">
                <span className="text-[#c9a84c] font-medium shrink-0">{i + 1}.</span>
                <span>{clause}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Signature */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle className="text-white text-base">Electronic signature</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#a1a1aa] text-sm">
              By typing your full name below, you confirm that you have read, understood, and agree to all of the above.
            </p>
            <div className="space-y-2">
              <Label htmlFor="signature" className="text-[#a1a1aa]">
                Type your full name: <span className="text-white">{booking.clientName}</span>
              </Label>
              <Input
                id="signature"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full name to sign"
                className="bg-[#0f0f0f] border-[#2a2a2a] text-white placeholder:text-[#52525b]"
              />
              {typedName && !nameMatches && (
                <p className="text-yellow-500 text-xs">Name must match exactly: {booking.clientName}</p>
              )}
            </div>
            <Button
              onClick={handleSign}
              disabled={!nameMatches || submitting}
              className="w-full bg-[#c9a84c] hover:bg-[#b8973b] text-black font-semibold disabled:opacity-40"
            >
              {submitting ? "Signing..." : "Sign consent form"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
