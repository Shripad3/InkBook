import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { adminClient } from "@/lib/supabase/admin";
import { getSignedUrl, BUCKETS } from "@/lib/supabase/storage";
import { formatCurrency } from "@/lib/utils/currency";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { BookingActions } from "@/components/bookings/BookingActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar, Clock, MapPin, Ruler, User, Mail, Phone,
  FileText, Image, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id, timezone").single();
  if (!artist) redirect("/sign-in");

  const { data: bookingRaw } = await adminClient
    .from("bookings")
    .select(`
      *,
      clients:client_id (*),
      session_types:session_type_id (*)
    `)
    .eq("id", id)
    .eq("artist_id", artist.id)
    .single();

  if (!bookingRaw) notFound();
  const booking = bookingRaw as any;

  const client = booking.clients;
  const sessionType = booking.session_types;

  // Fetch reference images with signed URLs
  const { data: refImages } = await adminClient
    .from("reference_images")
    .select("*")
    .eq("booking_id", id);

  const refImagesWithUrls = await Promise.all(
    (refImages ?? []).map(async (img) => ({
      ...img,
      signedUrl: await getSignedUrl(BUCKETS.REFERENCE_IMAGES, img.storage_path),
    }))
  );

  const tz = artist.timezone;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">
            {client.first_name} {client.last_name}
          </h1>
          <p className="text-muted-foreground text-sm">{sessionType.name}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* No-show warning */}
      {client.is_no_show_flagged && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            ⚠ Previous no-show ({client.no_show_count} time{client.no_show_count !== 1 ? "s" : ""})
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Appointment details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{format(new Date(booking.starts_at), "EEEE, MMMM d yyyy")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                {format(new Date(booking.starts_at), "h:mm a")} — {format(new Date(booking.ends_at), "h:mm a")}
                <span className="text-muted-foreground ml-1">({sessionType.duration_minutes}min)</span>
              </span>
            </div>
            {booking.placement && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{booking.placement}</span>
              </div>
            )}
            {booking.size_estimate && (
              <div className="flex items-center gap-3">
                <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="capitalize">{booking.size_estimate.replace("_", " ")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{client.first_name} {client.last_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a href={`mailto:${client.email}`} className="hover:text-[#c9a84c]">{client.email}</a>
            </div>
            {client.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <a href={`tel:${client.phone}`} className="hover:text-[#c9a84c]">{client.phone}</a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deposit</span>
              <span className="font-semibold">{formatCurrency(booking.deposit_amount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              {booking.deposit_paid ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" /> Yes
                </span>
              ) : (
                <span className="flex items-center gap-1 text-destructive">
                  <XCircle className="h-4 w-4" /> No
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consent form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consent Form</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              {booking.consent_form_signed_at ? (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Signed {format(new Date(booking.consent_form_signed_at), "MMM d")}
                </span>
              ) : (
                <span className="text-muted-foreground">Not signed</span>
              )}
            </div>
            {booking.consent_form_pdf_url && (
              <a
                href={`/api/consent-pdf/${booking.id}`}
                className="flex items-center gap-2 text-[#c9a84c] hover:underline"
              >
                <FileText className="h-4 w-4" />
                View signed form
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tattoo description */}
      {booking.style_description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tattoo description</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-3">
            <p>{booking.style_description}</p>
            {booking.is_coverup && (
              <div>
                <Badge variant="outline" className="mb-2">Cover-up</Badge>
                {booking.coverup_description && <p>{booking.coverup_description}</p>}
              </div>
            )}
            {booking.medical_notes && (
              <div className="pt-2">
                <p className="font-medium text-foreground mb-1">Medical notes</p>
                <p>{booking.medical_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reference images */}
      {refImagesWithUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Image className="h-4 w-4" />
              Reference images ({refImagesWithUrls.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {refImagesWithUrls.map((img) =>
                img.signedUrl ? (
                  <a
                    key={img.id}
                    href={img.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-square rounded-lg overflow-hidden border border-border hover:border-[#c9a84c] transition-colors"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.signedUrl} alt="Reference" className="w-full h-full object-cover" />
                  </a>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Artist notes + actions */}
      <BookingActions booking={{ ...booking, deposit_paid: booking.deposit_paid }} />
    </div>
  );
}
