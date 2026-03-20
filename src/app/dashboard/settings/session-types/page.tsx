"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Clock, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sessionTypeSchema, type SessionTypeInput } from "@/lib/validations/sessionType";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/types/database";

type SessionType = Database["public"]["Tables"]["session_types"]["Row"];

export default function SessionTypesPage() {
  const [loading, setLoading] = useState(true);
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<SessionTypeInput>({
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

  useEffect(() => { fetchTypes(); }, []);

  async function fetchTypes() {
    const supabase = createClient();
    const { data: artist } = await supabase.from("artists").select("id").single();
    if (!artist) return;
    const { data } = await supabase
      .from("session_types")
      .select("*")
      .eq("artist_id", artist.id)
      .order("created_at");
    if (data) setSessionTypes(data);
    setLoading(false);
  }

  async function onSave(data: SessionTypeInput) {
    setSaving(true);
    const supabase = createClient();
    const { data: artist } = await supabase.from("artists").select("id").single();
    if (!artist) return;

    const { error } = await supabase.from("session_types").insert({
      artist_id: artist.id,
      ...data,
      description: data.description ?? null,
    });

    setSaving(false);
    if (error) { toast.error("Failed to save"); return; }
    toast.success("Session type added");
    reset();
    setShowForm(false);
    fetchTypes();
  }

  async function toggleActive(id: string, current: boolean) {
    const supabase = createClient();
    await supabase.from("session_types").update({ is_active: !current }).eq("id", id);
    setSessionTypes((prev) => prev.map((t) => t.id === id ? { ...t, is_active: !current } : t));
  }

  async function deleteType(id: string) {
    if (!confirm("Delete this session type?")) return;
    setDeletingId(id);
    const supabase = createClient();
    await supabase.from("session_types").delete().eq("id", id);
    setSessionTypes((prev) => prev.filter((t) => t.id !== id));
    setDeletingId(null);
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Session types</h1>
        <Button variant="gold" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>

      {sessionTypes.map((st) => (
        <Card key={st.id}>
          <CardContent className="pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${!st.is_active ? "text-muted-foreground line-through" : ""}`}>
                    {st.name}
                  </span>
                  {!st.is_active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
                </div>
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                  <span><Clock className="h-3 w-3 inline mr-0.5" />{st.duration_minutes}min + {st.buffer_minutes}min buffer</span>
                  {st.price_from && <span>from {formatCurrency(st.price_from)}</span>}
                  <span>Deposit: {st.deposit_type === "fixed" ? formatCurrency(st.deposit_value) : `${st.deposit_value}%`}</span>
                  <span>{st.min_notice_hours}h notice</span>
                </div>
                {st.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{st.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={st.is_active}
                  onCheckedChange={() => toggleActive(st.id, st.is_active)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteType(st.id)}
                  disabled={deletingId === st.id}
                >
                  {deletingId === st.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">New session type</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input placeholder="e.g. Half-day session" {...register("name")} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" {...register("duration_minutes", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Buffer (min)</Label>
                  <Input type="number" {...register("buffer_minutes", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price from (€)</Label>
                  <Input type="number" {...register("price_from", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} />
                </div>
                <div className="space-y-2">
                  <Label>Price to (€)</Label>
                  <Input type="number" {...register("price_to", { valueAsNumber: true, setValueAs: (v) => v === "" ? null : Number(v) })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deposit</Label>
                <div className="flex items-center gap-4">
                  <div className="flex gap-3">
                    {["fixed", "percentage"].map((v) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" value={v} {...register("deposit_type")} className="accent-[#c9a84c]" />
                        {v === "fixed" ? "Fixed (€)" : "Percentage (%)"}
                      </label>
                    ))}
                  </div>
                  <Input type="number" className="w-28" {...register("deposit_value", { valueAsNumber: true })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={2} {...register("description")} />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="gold" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
