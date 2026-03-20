"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

const DAYS = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

interface DayHours {
  is_available: boolean;
  start_time: string;
  end_time: string;
}

const defaultHours: Record<number, DayHours> = {
  0: { is_available: false, start_time: "10:00", end_time: "18:00" },
  1: { is_available: false, start_time: "10:00", end_time: "18:00" },
  2: { is_available: true, start_time: "10:00", end_time: "18:00" },
  3: { is_available: true, start_time: "10:00", end_time: "18:00" },
  4: { is_available: true, start_time: "10:00", end_time: "18:00" },
  5: { is_available: true, start_time: "10:00", end_time: "18:00" },
  6: { is_available: true, start_time: "10:00", end_time: "18:00" },
};

export function StepAvailability() {
  const store = useOnboardingStore();
  const [hours, setHours] = useState<Record<number, DayHours>>(defaultHours);
  const [loading, setLoading] = useState(false);

  function toggleDay(day: number) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], is_available: !prev[day].is_available },
    }));
  }

  function updateTime(day: number, field: "start_time" | "end_time", value: string) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  async function onSave() {
    const activeDays = DAYS.filter((d) => hours[d.value].is_available);
    if (activeDays.length === 0) {
      toast.error("Select at least one working day");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const rows = DAYS.map((d) => ({
      artist_id: store.artistId!,
      day_of_week: d.value,
      start_time: hours[d.value].start_time,
      end_time: hours[d.value].end_time,
      is_available: hours[d.value].is_available,
    }));

    const { error } = await supabase
      .from("working_hours")
      .upsert(rows, { onConflict: "artist_id,day_of_week" });

    setLoading(false);

    if (error) {
      toast.error("Failed to save availability");
      return;
    }

    store.setAvailabilityAdded(true);
    store.setStep(4);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your working hours</CardTitle>
        <CardDescription>
          Set which days and hours clients can book with you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {DAYS.map((day) => (
          <div key={day.value} className="flex items-center gap-4">
            <Switch
              checked={hours[day.value].is_available}
              onCheckedChange={() => toggleDay(day.value)}
            />
            <span
              className={`w-10 text-sm font-medium ${
                hours[day.value].is_available ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {day.label}
            </span>
            {hours[day.value].is_available ? (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={hours[day.value].start_time}
                  onChange={(e) => updateTime(day.value, "start_time", e.target.value)}
                  className="h-9 w-28 rounded-md border border-input bg-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="text-muted-foreground text-sm">to</span>
                <input
                  type="time"
                  value={hours[day.value].end_time}
                  onChange={(e) => updateTime(day.value, "end_time", e.target.value)}
                  className="h-9 w-28 rounded-md border border-input bg-input px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Unavailable</span>
            )}
          </div>
        ))}

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => store.setStep(2)}
          >
            ← Back
          </Button>
          <Button variant="gold" className="flex-1" onClick={onSave} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
