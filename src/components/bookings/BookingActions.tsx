"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { BookingStatus } from "@/types/database";

interface Props {
  booking: {
    id: string;
    status: string;
    artist_notes: string | null;
  };
}

export function BookingActions({ booking }: Props) {
  const router = useRouter();
  const [notes, setNotes] = useState(booking.artist_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  async function updateStatus(status: BookingStatus) {
    setUpdating(status);
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(null);
    if (res.ok) {
      toast.success("Booking updated");
      router.refresh();
    } else {
      toast.error("Failed to update booking");
    }
  }

  async function saveNotes() {
    setSaving(true);
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artistNotes: notes }),
    });
    setSaving(false);
    if (res.ok) toast.success("Notes saved");
    else toast.error("Failed to save notes");
  }

  const isActive = ["pending_deposit", "confirmed"].includes(booking.status);

  return (
    <div className="space-y-4">
      {/* Actions */}
      {isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {booking.status === "confirmed" && (
              <Button
                variant="secondary"
                onClick={() => updateStatus("completed")}
                disabled={!!updating}
              >
                {updating === "completed" ? <Loader2 className="h-4 w-4 animate-spin" /> : "✓ Mark Complete"}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => updateStatus("no_show")}
              disabled={!!updating}
            >
              {updating === "no_show" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark No-show"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => updateStatus("cancelled_artist")}
              disabled={!!updating}
            >
              {updating === "cancelled_artist" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel Booking"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Artist notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Private notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="sr-only">Artist notes (not visible to client)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Private notes about this booking (not visible to client)..."
            rows={3}
          />
          <Button variant="secondary" size="sm" onClick={saveNotes} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1" />Save notes</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
