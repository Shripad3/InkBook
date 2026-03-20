"use client";

import { useState, useEffect } from "react";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

interface Slot {
  startsAt: string;
  endsAt: string;
  label: string;
}

interface Props {
  artist: Artist;
}

export function DateTimePicker({ artist }: Props) {
  const { selectedSessionType, setDate, setSlot, setStep } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfDay(new Date()));

  const today = startOfDay(new Date());
  const maxDate = addDays(today, selectedSessionType?.max_advance_days ?? 60);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  function prevWeek() {
    setCurrentWeekStart((d) => addDays(d, -7));
    setSelectedDate(null);
    setSlots([]);
  }

  function nextWeek() {
    setCurrentWeekStart((d) => addDays(d, 7));
    setSelectedDate(null);
    setSlots([]);
  }

  async function selectDate(date: Date) {
    if (isBefore(date, today) || isBefore(maxDate, date)) return;
    setSelectedDate(date);
    setSlots([]);
    setLoadingSlots(true);

    const dateStr = format(date, "yyyy-MM-dd");
    const res = await fetch(
      `/api/availability?artist_id=${artist.id}&date=${dateStr}&session_type_id=${selectedSessionType!.id}`
    );
    const data = await res.json();
    setLoadingSlots(false);
    setSlots(data.slots ?? []);
  }

  function selectSlot(slot: Slot) {
    setDate(selectedDate!);
    setSlot(slot);
    setStep(3);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Pick a date</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(1)}
          className="text-muted-foreground"
        >
          ← Change session
        </Button>
      </div>

      {/* Selected session summary */}
      {selectedSessionType && (
        <div className="px-4 py-3 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/5 text-sm">
          <span className="font-medium text-[#c9a84c]">{selectedSessionType.name}</span>
          <span className="text-muted-foreground ml-2">
            — {selectedSessionType.duration_minutes}min session
          </span>
        </div>
      )}

      {/* Week navigator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevWeek}
            disabled={isBefore(currentWeekStart, today)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {format(currentWeekStart, "MMM d")} – {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const isPast = isBefore(day, today);
            const isTooFar = isBefore(maxDate, day);
            const isDisabled = isPast || isTooFar;
            const isSelected = selectedDate && format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isDisabled && selectDate(day)}
                disabled={isDisabled}
                className={`flex flex-col items-center gap-1 py-3 rounded-lg transition-colors ${
                  isSelected
                    ? "bg-[#c9a84c] text-black"
                    : isDisabled
                    ? "opacity-30 cursor-not-allowed"
                    : "hover:bg-muted cursor-pointer"
                }`}
              >
                <span className="text-xs">{format(day, "EEE")}</span>
                <span className="text-sm font-semibold">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-3">
          <h3 className="font-medium">Available times</h3>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking availability...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">
              No available slots on this day. Try another date.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  onClick={() => selectSlot(slot)}
                  className="py-2.5 px-2 rounded-lg border border-border hover:border-[#c9a84c] hover:bg-[#c9a84c]/10 hover:text-[#c9a84c] text-sm font-medium transition-all"
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
