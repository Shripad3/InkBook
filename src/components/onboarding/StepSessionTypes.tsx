"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Clock, Euro } from "lucide-react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { createClient } from "@/lib/supabase/client";
import { sessionTypeSchema, type SessionTypeInput } from "@/lib/validations/sessionType";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/types/database";

type SessionType = Database["public"]["Tables"]["session_types"]["Row"];

const DEPOSIT_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed amount (€)" },
  { value: "percentage", label: "Percentage (%)" },
];

export function StepSessionTypes() {
  const store = useOnboardingStore();
  const [loading, setLoading] = useState(false);
  const [savedTypes, setSavedTypes] = useState<SessionType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SessionTypeInput>({
    resolver: zodResolver(sessionTypeSchema),
    defaultValues: {
      duration_minutes: 120,
      buffer_minutes: 30,
      deposit_type: "fixed",
      deposit_value: 50,
      requires_consultation: false,
      requires_reference_image: false,
      min_notice_hours: 48,
      max_advance_days: 60,
    },
  });

  const depositType = watch("deposit_type");

  useEffect(() => {
    fetchSessionTypes();
  }, []);

  async function fetchSessionTypes() {
    const supabase = createClient();
    const { data } = await supabase
      .from("session_types")
      .select("*")
      .eq("artist_id", store.artistId!)
      .order("created_at");
    if (data) setSavedTypes(data);
  }

  async function onSave(data: SessionTypeInput) {
    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from("session_types").insert({
      artist_id: store.artistId!,
      name: data.name,
      duration_minutes: data.duration_minutes,
      buffer_minutes: data.buffer_minutes,
      price_from: data.price_from,
      price_to: data.price_to,
      deposit_type: data.deposit_type,
      deposit_value: data.deposit_value,
      requires_consultation: data.requires_consultation,
      requires_reference_image: data.requires_reference_image,
      min_notice_hours: data.min_notice_hours,
      max_advance_days: data.max_advance_days,
      description: data.description ?? null,
    });

    setLoading(false);

    if (error) {
      toast.error("Failed to save session type");
      return;
    }

    toast.success("Session type added");
    reset();
    setShowForm(false);
    fetchSessionTypes();
    store.setSessionTypesAdded(true);
  }

  async function deleteType(id: string) {
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("session_types").delete().eq("id", id);
    setSavedTypes((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  async function onContinue() {
    if (savedTypes.length === 0) {
      toast.error("Add at least one session type before continuing");
      return;
    }
    store.setStep(3);
  }

  return (
    <div className="space-y-6">
      {/* Saved types */}
      {savedTypes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Your session types
          </h3>
          {savedTypes.map((type) => (
            <Card key={type.id} className="flex items-center justify-between p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{type.name}</span>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {type.duration_minutes}min
                  </Badge>
                  {type.price_from && (
                    <Badge variant="outline" className="text-xs">
                      from €{type.price_from}
                    </Badge>
                  )}
                </div>
                {type.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{type.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteType(type.id)}
                disabled={deletingId === type.id}
              >
                {deletingId === type.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Add form */}
      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add session type</CardTitle>
            <CardDescription>
              This will appear as a bookable option on your public page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="space-y-2">
                <Label>Session name *</Label>
                <Input placeholder="e.g. Half-day session, Small tattoo" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (minutes) *</Label>
                  <Input
                    type="number"
                    {...register("duration_minutes", { valueAsNumber: true })}
                  />
                  {errors.duration_minutes && (
                    <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Buffer after (minutes)</Label>
                  <Input
                    type="number"
                    {...register("buffer_minutes", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price from (€)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("price_from", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price to (€)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register("price_to", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deposit type</Label>
                <div className="flex gap-3">
                  {DEPOSIT_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value={opt.value}
                        {...register("deposit_type")}
                        className="accent-[#c9a84c]"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deposit amount {depositType === "fixed" ? "(€)" : "(%)"}</Label>
                <Input
                  type="number"
                  {...register("deposit_value", { valueAsNumber: true })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Min notice (hours)</Label>
                  <Input type="number" {...register("min_notice_hours", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Max advance (days)</Label>
                  <Input type="number" {...register("max_advance_days", { valueAsNumber: true })} />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="consultation"
                    {...register("requires_consultation")}
                    onCheckedChange={(v) => {
                      register("requires_consultation").onChange({ target: { value: v } });
                    }}
                  />
                  <Label htmlFor="consultation" className="cursor-pointer text-sm">Requires consultation first</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="reference"
                    {...register("requires_reference_image")}
                    onCheckedChange={(v) => {
                      register("requires_reference_image").onChange({ target: { value: v } });
                    }}
                  />
                  <Label htmlFor="reference" className="cursor-pointer text-sm">Reference image required</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (shown to clients)</Label>
                <Textarea rows={2} placeholder="What to expect from this session type..." {...register("description")} />
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="gold" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Session Type"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed h-14"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a session type
        </Button>
      )}

      <Button
        variant="gold"
        className="w-full"
        onClick={onContinue}
        disabled={savedTypes.length === 0}
      >
        Continue →
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        You can add, edit, or remove session types later from your settings.
      </p>
    </div>
  );
}
