"use client";

import { useBookingStore } from "@/store/bookingStore";
import { SessionTypePicker } from "./SessionTypePicker";
import { DateTimePicker } from "./DateTimePicker";
import { BookingForm } from "./BookingForm";
import type { Database } from "@/types/database";

type Artist = Database["public"]["Tables"]["artists"]["Row"];
type SessionType = Database["public"]["Tables"]["session_types"]["Row"];

interface Props {
  artist: Artist;
  sessionTypes: SessionType[];
}

export function BookingWizard({ artist, sessionTypes }: Props) {
  const { step } = useBookingStore();

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: "Choose session" },
          { n: 2, label: "Pick date & time" },
          { n: 3, label: "Your details" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            {i > 0 && <div className="w-8 h-px bg-border" />}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s.n
                    ? "bg-[#c9a84c] text-black"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s.n}
              </div>
              <span
                className={`text-sm hidden sm:block ${
                  step >= s.n ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {step === 1 && (
        <SessionTypePicker sessionTypes={sessionTypes} />
      )}
      {step === 2 && (
        <DateTimePicker artist={artist} />
      )}
      {step === 3 && (
        <BookingForm artist={artist} />
      )}
    </div>
  );
}
