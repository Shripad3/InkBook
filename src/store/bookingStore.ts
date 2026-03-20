import { create } from "zustand";
import type { Database } from "@/types/database";

type SessionType = Database["public"]["Tables"]["session_types"]["Row"];

export interface BookingState {
  step: number;
  selectedSessionType: SessionType | null;
  selectedDate: Date | null;
  selectedSlot: { startsAt: string; endsAt: string; label: string } | null;
  bookingId: string | null;
  depositAmount: number;

  setStep: (step: number) => void;
  setSessionType: (st: SessionType) => void;
  setDate: (date: Date) => void;
  setSlot: (slot: { startsAt: string; endsAt: string; label: string }) => void;
  setBookingId: (id: string) => void;
  setDepositAmount: (amount: number) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedSessionType: null,
  selectedDate: null,
  selectedSlot: null,
  bookingId: null,
  depositAmount: 0,

  setStep: (step) => set({ step }),
  setSessionType: (selectedSessionType) => set({ selectedSessionType }),
  setDate: (selectedDate) => set({ selectedDate }),
  setSlot: (selectedSlot) => set({ selectedSlot }),
  setBookingId: (bookingId) => set({ bookingId }),
  setDepositAmount: (depositAmount) => set({ depositAmount }),
  reset: () =>
    set({
      step: 1,
      selectedSessionType: null,
      selectedDate: null,
      selectedSlot: null,
      bookingId: null,
      depositAmount: 0,
    }),
}));
