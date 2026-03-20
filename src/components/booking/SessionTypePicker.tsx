"use client";

import { Clock, Euro, AlertCircle } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";
import { formatCurrency } from "@/lib/utils/currency";
import type { Database } from "@/types/database";

type SessionType = Database["public"]["Tables"]["session_types"]["Row"];

interface Props {
  sessionTypes: SessionType[];
}

export function SessionTypePicker({ sessionTypes }: Props) {
  const { setSessionType, setStep } = useBookingStore();

  function select(st: SessionType) {
    setSessionType(st);
    setStep(2);
  }

  if (sessionTypes.length === 0) {
    return (
      <div className="flex items-center gap-3 p-6 rounded-lg border border-border bg-card text-muted-foreground">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">No session types available. Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Choose a session type</h2>
      <div className="grid gap-3">
        {sessionTypes.map((st) => (
          <button
            key={st.id}
            onClick={() => select(st)}
            className="w-full text-left p-5 rounded-lg border border-border bg-card hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold group-hover:text-[#c9a84c] transition-colors">
                  {st.name}
                </h3>
                {st.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {st.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {st.duration_minutes >= 60
                      ? `${Math.floor(st.duration_minutes / 60)}h${st.duration_minutes % 60 ? ` ${st.duration_minutes % 60}m` : ""}`
                      : `${st.duration_minutes}m`}
                  </span>
                  {st.requires_consultation && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-amber-500/30 text-amber-400">
                      Consultation required
                    </span>
                  )}
                  {st.requires_reference_image && (
                    <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      Reference image required
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                {st.price_from ? (
                  <p className="font-semibold text-[#c9a84c]">
                    from {formatCurrency(st.price_from)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">POA</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Deposit:{" "}
                  {st.deposit_type === "fixed"
                    ? formatCurrency(st.deposit_value)
                    : `${st.deposit_value}%`}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
