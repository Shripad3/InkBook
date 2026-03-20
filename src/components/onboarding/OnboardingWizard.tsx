"use client";

import { useEffect } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { StepProfile } from "./StepProfile";
import { StepSessionTypes } from "./StepSessionTypes";
import { StepAvailability } from "./StepAvailability";
import { StepStripeConnect } from "./StepStripeConnect";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/types/database";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

interface Props {
  artist: Artist;
}

const STEPS = [
  { number: 1, label: "Profile" },
  { number: 2, label: "Session Types" },
  { number: 3, label: "Availability" },
  { number: 4, label: "Payments" },
];

export function OnboardingWizard({ artist }: Props) {
  const { step, setArtistId, setProfile } = useOnboardingStore();

  useEffect(() => {
    setArtistId(artist.id);
    setProfile({
      name: artist.name ?? "",
      slug: artist.slug,
      bio: artist.bio ?? "",
      instagramHandle: artist.instagram_handle ?? "",
      studioName: artist.studio_name ?? "",
      styleTags: artist.style_tags ?? [],
      timezone: artist.timezone,
    });
  }, [artist, setArtistId, setProfile]);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-[#c9a84c]">InkBook</span>
          <span className="text-sm text-muted-foreground">
            Step {step} of {STEPS.length}
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s) => (
            <div
              key={s.number}
              className={`text-xs font-medium ${
                step >= s.number ? "text-[#c9a84c]" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        {step === 1 && <StepProfile />}
        {step === 2 && <StepSessionTypes />}
        {step === 3 && <StepAvailability />}
        {step === 4 && <StepStripeConnect />}
      </main>
    </div>
  );
}
