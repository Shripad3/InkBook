import { create } from "zustand";

export interface OnboardingState {
  step: number;
  artistId: string | null;
  // Step 1 — Profile
  name: string;
  slug: string;
  bio: string;
  instagramHandle: string;
  studioName: string;
  styleTags: string[];
  timezone: string;
  // Step 2 — Session types (managed separately via DB)
  sessionTypesAdded: boolean;
  // Step 3 — Availability (managed separately via DB)
  availabilityAdded: boolean;
  // Step 4 — Stripe
  stripeConnected: boolean;

  setStep: (step: number) => void;
  setArtistId: (id: string) => void;
  setProfile: (data: Partial<OnboardingState>) => void;
  setSessionTypesAdded: (v: boolean) => void;
  setAvailabilityAdded: (v: boolean) => void;
  setStripeConnected: (v: boolean) => void;
  reset: () => void;
}

const STYLE_TAGS_DEFAULT: string[] = [];

const initialState = {
  step: 1,
  artistId: null,
  name: "",
  slug: "",
  bio: "",
  instagramHandle: "",
  studioName: "",
  styleTags: STYLE_TAGS_DEFAULT,
  timezone: "Europe/Dublin",
  sessionTypesAdded: false,
  availabilityAdded: false,
  stripeConnected: false,
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setArtistId: (artistId) => set({ artistId }),
  setProfile: (data) => set((s) => ({ ...s, ...data })),
  setSessionTypesAdded: (sessionTypesAdded) => set({ sessionTypesAdded }),
  setAvailabilityAdded: (availabilityAdded) => set({ availabilityAdded }),
  setStripeConnected: (stripeConnected) => set({ stripeConnected }),
  reset: () => set(initialState),
}));
