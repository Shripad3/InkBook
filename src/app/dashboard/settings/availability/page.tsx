"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

interface DayHours {
  is_available: boolean;
  start_time: string;
  end_time: string;
}

export default function AvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<Record<number, DayHours>>({});
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("artists").select("id").single().then(({ data: artist }) => {
      if (!artist) return;
      setArtistId(artist.id);
      supabase.from("working_hours").select("*").eq("artist_id", artist.id).then(({ data }) => {
        const map: Record<number, DayHours> = {};
        DAYS.forEach((d) => {
          const existing = data?.find((r) => r.day_of_week === d.value);
          map[d.value] = existing
            ? { is_available: existing.is_available, start_time: existing.start_time, end_time: existing.end_time }
            : { is_available: false, start_time: "10:00", end_time: "18:00" };
        });
        setHours(map);
        setLoading(false);
      });
    });
  }, []);

  function toggleDay(day: number) {
    setHours((p) => ({ ...p, [day]: { ...p[day], is_available: !p[day].is_available } }));
  }

  function updateTime(day: number, field: "start_time" | "end_time", value: string) {
    setHours((p) => ({ ...p, [day]: { ...p[day], [field]: value } }));
  }

  async function save() {
    if (!artistId) return;
    setSaving(true);
    const supabase = createClient();
    const rows = DAYS.map((d) => ({
      artist_id: artistId,
      day_of_week: d.value,
      ...hours[d.value],
    }));
    const { error } = await supabase
      .from("working_hours")
      .upsert(rows, { onConflict: "artist_id,day_of_week" });
    setSaving(false);
    if (error) toast.error("Failed to save");
    else toast.success("Availability saved");
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Availability</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Working hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map((day) => (
            <div key={day.value} className="flex items-center gap-4">
              <Switch
                checked={hours[day.value]?.is_available ?? false}
                onCheckedChange={() => toggleDay(day.value)}
              />
              <span className={`w-24 text-sm font-medium ${hours[day.value]?.is_available ? "text-foreground" : "text-muted-foreground"}`}>
                {day.label}
              </span>
              {hours[day.value]?.is_available ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hours[day.value]?.start_time ?? "10:00"}
                    onChange={(e) => updateTime(day.value, "start_time", e.target.value)}
                    className="h-9 w-28 rounded-md border border-input bg-input px-2 text-sm"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <input
                    type="time"
                    value={hours[day.value]?.end_time ?? "18:00"}
                    onChange={(e) => updateTime(day.value, "end_time", e.target.value)}
                    className="h-9 w-28 rounded-md border border-input bg-input px-2 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unavailable</span>
              )}
            </div>
          ))}
          <Button variant="gold" onClick={save} disabled={saving} className="mt-4">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save availability"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
