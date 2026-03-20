"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";
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

const schema = z.object({
  name: z.string().min(2),
  bio: z.string().max(500).optional(),
  instagram_handle: z.string().optional(),
  studio_name: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [slug, setSlug] = useState("");
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.from("artists").select("*").single().then(({ data }) => {
      if (data) {
        reset({
          name: data.name ?? "",
          bio: data.bio ?? "",
          instagram_handle: data.instagram_handle ?? "",
          studio_name: data.studio_name ?? "",
        });
        setStyleTags(data.style_tags ?? []);
        setSlug(data.slug);
      }
      setLoading(false);
    });
  }, [reset]);

  function toggleTag(tag: string) {
    setStyleTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("artists").update({
      name: data.name,
      bio: data.bio ?? null,
      instagram_handle: data.instagram_handle ?? null,
      studio_name: data.studio_name ?? null,
      style_tags: styleTags,
    });
    setSaving(false);

    if (error) toast.error("Failed to save: " + error.message);
    else toast.success("Profile saved");
  }

  function copyBookingLink() {
    navigator.clipboard.writeText(`${window.location.origin}/book/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile settings</h1>

      {/* Booking link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your booking link</CardTitle>
          <CardDescription>Share this in your Instagram bio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-md border border-border bg-muted text-sm font-mono truncate">
              {typeof window !== "undefined" ? window.location.origin : "https://inkbook.io"}/book/{slug}
            </code>
            <Button variant="outline" size="icon" onClick={copyBookingLink}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Artist profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea rows={4} {...register("bio")} />
            </div>
            <div className="space-y-2">
              <Label>Instagram handle</Label>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">@</span>
                <Input {...register("instagram_handle")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Studio name</Label>
              <Input {...register("studio_name")} />
            </div>
            <div className="space-y-2">
              <Label>Styles</Label>
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
            <Button type="submit" variant="gold" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
