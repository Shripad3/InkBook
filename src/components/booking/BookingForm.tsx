"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Upload, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { useBookingStore } from "@/store/bookingStore";
import { bookingFormSchema, type BookingFormInput } from "@/lib/validations/booking";
import { formatCurrency } from "@/lib/utils/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/types/database";
import { BUCKETS } from "@/lib/supabase/storage";

type Artist = Database["public"]["Tables"]["artists"]["Row"];

const SIZE_OPTIONS = [
  { value: "tiny", label: "Tiny (<5cm)" },
  { value: "small", label: "Small (5–10cm)" },
  { value: "medium", label: "Medium (10–20cm)" },
  { value: "large", label: "Large (20cm+)" },
];

interface Props {
  artist: Artist;
}

export function BookingForm({ artist }: Props) {
  const router = useRouter();
  const store = useBookingStore();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [referenceFiles, setReferenceFiles] = useState<{ file: File; path?: string }[]>([]);
  const [noShowWarning, setNoShowWarning] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<BookingFormInput>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { isCoverup: false, ageConfirmed: false, cancellationAgreed: false },
  });

  const isCoverup = watch("isCoverup");
  const emailValue = watch("email");

  // Check for no-show flag on email change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!emailValue || !emailValue.includes("@")) return;
      const res = await fetch(`/api/clients/lookup?email=${encodeURIComponent(emailValue)}`);
      const data = await res.json();
      setNoShowWarning(data.client?.is_no_show_flagged ?? false);
    }, 700);
    return () => clearTimeout(timer);
  }, [emailValue]);

  async function uploadFile(file: File): Promise<string | null> {
    const ext = file.name.split(".").pop();
    const path = `${artist.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket: BUCKETS.REFERENCE_IMAGES, path }),
    });

    const { signedUrl, error } = await res.json();
    if (error) return null;

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });

    return uploadRes.ok ? path : null;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (referenceFiles.length + files.length > 3) {
      toast.error("Maximum 3 reference images");
      return;
    }
    setReferenceFiles((prev) => [...prev, ...files.map((f) => ({ file: f }))]);
  }

  function removeFile(index: number) {
    setReferenceFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: BookingFormInput) {
    if (!store.selectedSlot || !store.selectedSessionType) return;

    setSubmitting(true);

    // Upload reference images
    const uploadedPaths: string[] = [];
    for (const ref of referenceFiles) {
      const path = await uploadFile(ref.file);
      if (path) uploadedPaths.push(path);
    }

    // Create booking
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artistId: artist.id,
        sessionTypeId: store.selectedSessionType.id,
        startsAt: store.selectedSlot.startsAt,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        placement: data.placement,
        sizeEstimate: data.sizeEstimate,
        styleDescription: data.styleDescription,
        isCoverup: data.isCoverup,
        coverupDescription: data.coverupDescription,
        medicalNotes: data.medicalNotes,
        referenceImagePaths: uploadedPaths,
      }),
    });

    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error("Failed to create booking: " + result.error);
      return;
    }

    store.setBookingId(result.bookingId);
    store.setDepositAmount(result.depositAmount);

    router.push(`/book/${artist.slug}/confirm?booking_id=${result.bookingId}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your details</h2>
        <Button variant="ghost" size="sm" onClick={() => store.setStep(2)} className="text-muted-foreground">
          ← Change time
        </Button>
      </div>

      {/* Booking summary */}
      {store.selectedSlot && store.selectedSessionType && store.selectedDate && (
        <div className="p-4 rounded-lg border border-border bg-card space-y-1 text-sm">
          <p className="font-medium">{store.selectedSessionType.name}</p>
          <p className="text-muted-foreground">
            {format(store.selectedDate, "EEEE, MMMM d yyyy")} at {store.selectedSlot.label}
          </p>
          <p className="text-[#c9a84c] font-medium">
            Deposit required:{" "}
            {formatCurrency(
              store.selectedSessionType.deposit_type === "fixed"
                ? store.selectedSessionType.deposit_value
                : (store.selectedSessionType.price_from ?? 0) *
                  (store.selectedSessionType.deposit_value / 100)
            )}
          </p>
        </div>
      )}

      {/* No-show warning */}
      {noShowWarning && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">
            This email has a previous no-show on record. A higher deposit (50%) will be required.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>First name *</Label>
            <Input placeholder="Jane" {...register("firstName")} />
            {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Last name *</Label>
            <Input placeholder="Smith" {...register("lastName")} />
            {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Email address *</Label>
          <Input type="email" placeholder="jane@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Phone number *</Label>
          <Input type="tel" placeholder="+353 87 123 4567" {...register("phone")} />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        {/* Tattoo details */}
        <div className="space-y-2">
          <Label>Placement *</Label>
          <Input placeholder="e.g. Left forearm, upper back, behind ear" {...register("placement")} />
          {errors.placement && <p className="text-xs text-destructive">{errors.placement.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Approximate size *</Label>
          <Select onValueChange={(v) => setValue("sizeEstimate", v as BookingFormInput["sizeEstimate"])}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sizeEstimate && <p className="text-xs text-destructive">{errors.sizeEstimate.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Describe your tattoo idea *</Label>
          <Textarea
            rows={4}
            placeholder="Describe what you'd like — style, references, specific elements, colours, mood..."
            {...register("styleDescription")}
          />
          {errors.styleDescription && (
            <p className="text-xs text-destructive">{errors.styleDescription.message}</p>
          )}
        </div>

        {/* Cover-up */}
        <div className="flex items-center gap-3">
          <Checkbox
            id="coverup"
            onCheckedChange={(v) => setValue("isCoverup", Boolean(v))}
          />
          <Label htmlFor="coverup" className="cursor-pointer">Is this a cover-up?</Label>
        </div>

        {isCoverup && (
          <div className="space-y-2">
            <Label>Describe the existing tattoo to be covered</Label>
            <Textarea rows={2} placeholder="Size, colours, design of existing tattoo..." {...register("coverupDescription")} />
            {errors.coverupDescription && (
              <p className="text-xs text-destructive">{errors.coverupDescription.message}</p>
            )}
          </div>
        )}

        {/* Reference images */}
        <div className="space-y-2">
          <Label>Reference images (up to 3)</Label>
          <div className="flex flex-wrap gap-2">
            {referenceFiles.map((ref, i) => (
              <div
                key={i}
                className="relative w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(ref.file)}
                  alt="Reference"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {referenceFiles.length < 3 && (
              <label className="w-20 h-20 rounded-lg border border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a84c]/50 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">Add</span>
                <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFileChange} />
              </label>
            )}
          </div>
        </div>

        {/* Medical notes */}
        <div className="space-y-2">
          <Label>Medical notes (optional)</Label>
          <Textarea
            rows={2}
            placeholder="Any skin conditions, allergies, or medications we should know about?"
            {...register("medicalNotes")}
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-3">
            <Checkbox
              id="age"
              onCheckedChange={(v) => setValue("ageConfirmed", Boolean(v))}
            />
            <Label htmlFor="age" className="cursor-pointer text-sm font-normal leading-relaxed">
              I confirm I am 18 years or older *
            </Label>
          </div>
          {errors.ageConfirmed && (
            <p className="text-xs text-destructive pl-7">{errors.ageConfirmed.message}</p>
          )}

          <div className="flex items-start gap-3">
            <Checkbox
              id="cancel"
              onCheckedChange={(v) => setValue("cancellationAgreed", Boolean(v))}
            />
            <Label htmlFor="cancel" className="cursor-pointer text-sm font-normal leading-relaxed">
              I agree to the cancellation policy: deposits are non-refundable if cancelled within 48 hours *
            </Label>
          </div>
          {errors.cancellationAgreed && (
            <p className="text-xs text-destructive pl-7">{errors.cancellationAgreed.message}</p>
          )}
        </div>

        <Button type="submit" variant="gold" className="w-full h-12 text-base" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            "Proceed to Deposit Payment →"
          )}
        </Button>
      </form>
    </div>
  );
}
