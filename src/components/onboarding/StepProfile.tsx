"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const STYLE_TAGS = [
  "Realism", "Neo-traditional", "Fine line", "Japanese", "Blackwork",
  "Watercolour", "Geometric", "Tribal", "Cover-ups", "Other",
];

const TIMEZONES = [
  "Europe/Dublin", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Europe/Amsterdam", "Europe/Madrid", "Europe/Rome", "Europe/Warsaw",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Australia/Sydney", "Asia/Tokyo",
];

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  bio: z.string().max(500, "Bio max 500 characters").optional(),
  instagramHandle: z.string().optional(),
  studioName: z.string().optional(),
  timezone: z.string().min(1, "Select a timezone"),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function StepProfile() {
  const store = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [styleTags, setStyleTags] = useState<string[]>(store.styleTags);
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "ok" | "taken">("idle");

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: store.name,
      slug: store.slug,
      bio: store.bio,
      instagramHandle: store.instagramHandle,
      studioName: store.studioName,
      timezone: store.timezone,
    },
  });

  const nameValue = watch("name");
  const slugValue = watch("slug");

  // Auto-generate slug from name
  useEffect(() => {
    if (nameValue && !store.slug) {
      const generated = nameValue.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      setValue("slug", generated);
    }
  }, [nameValue, store.slug, setValue]);

  // Debounced slug check
  const checkSlug = useCallback(async (slug: string) => {
    if (slug.length < 3) return;
    setSlugStatus("checking");
    const res = await fetch(`/api/artists/check-slug?slug=${slug}`);
    const data = await res.json();
    setSlugStatus(data.available ? "ok" : "taken");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slugValue && slugValue !== store.slug) checkSlug(slugValue);
    }, 500);
    return () => clearTimeout(timer);
  }, [slugValue, store.slug, checkSlug]);

  function toggleTag(tag: string) {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function onSubmit(data: ProfileInput) {
    if (styleTags.length === 0) {
      toast.error("Select at least one style");
      return;
    }
    if (slugStatus === "taken") {
      toast.error("That booking URL is taken");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("artists")
      .update({
        name: data.name,
        slug: data.slug,
        bio: data.bio ?? null,
        instagram_handle: data.instagramHandle ? `@${data.instagramHandle.replace("@", "")}` : null,
        studio_name: data.studioName ?? null,
        style_tags: styleTags,
        timezone: data.timezone,
      })
      .eq("id", store.artistId!);

    setLoading(false);

    if (error) {
      toast.error("Failed to save profile: " + error.message);
      return;
    }

    store.setProfile({ ...data, styleTags });
    store.setStep(2);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your artist profile</CardTitle>
        <CardDescription>
          This information appears on your public booking page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Your name *</Label>
            <Input id="name" placeholder="Mike Tattoos" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Your booking URL *</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm whitespace-nowrap">inkbook.io/book/</span>
              <div className="relative flex-1">
                <Input id="slug" placeholder="mike-tattoos" {...register("slug")} />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {slugStatus === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {slugStatus === "ok" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  {slugStatus === "taken" && <XCircle className="h-4 w-4 text-destructive" />}
                </div>
              </div>
            </div>
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            {slugStatus === "taken" && (
              <p className="text-sm text-destructive">That URL is taken. Try a different one.</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Tell clients about your style, experience, and what you love to tattoo..."
              rows={4}
              {...register("bio")}
            />
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram handle</Label>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">@</span>
              <Input
                id="instagram"
                placeholder="miketattoos"
                {...register("instagramHandle")}
                className="flex-1"
              />
            </div>
          </div>

          {/* Studio name */}
          <div className="space-y-2">
            <Label htmlFor="studio">Studio name (optional)</Label>
            <Input id="studio" placeholder="Black Rose Studio" {...register("studioName")} />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Your timezone *</Label>
            <select
              id="timezone"
              {...register("timezone")}
              className="flex h-10 w-full rounded-md border border-input bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {/* Style tags */}
          <div className="space-y-2">
            <Label>Your styles *</Label>
            <div className="flex flex-wrap gap-2">
              {STYLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    styleTags.includes(tag)
                      ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]"
                      : "border-border text-muted-foreground hover:border-[#c9a84c]/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="gold" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Continue →"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
