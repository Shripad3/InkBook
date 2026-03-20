import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { verifyToken } from "@/lib/utils/tokens";
import { formatDate, formatTime } from "@/lib/utils/date";
import { renderToBuffer } from "@react-pdf/renderer";
import { ConsentFormPDF } from "@/lib/pdf/consent";
import React from "react";

export const runtime = "nodejs";

type Params = { params: Promise<{ token: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  // Secured with internal secret — only callable from our own API
  const secret = req.headers.get("x-internal-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const bookingId = verifyToken(token);
  if (!bookingId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  const { data: booking, error } = await adminClient
    .from("bookings")
    .select(`
      id, starts_at, placement, size_estimate, medical_notes, consent_form_signed_at,
      clients:client_id (email, first_name, last_name),
      artists:artist_id (name, timezone),
      session_types:session_type_id (name)
    `)
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const b = booking as any;
  if (!b.consent_form_signed_at) {
    return NextResponse.json({ error: "Not signed yet" }, { status: 400 });
  }

  const tz = b.artists?.timezone ?? "UTC";
  const clientName = `${b.clients?.first_name} ${b.clients?.last_name}`;
  const signedAt = new Date(b.consent_form_signed_at).toLocaleString("en-IE", {
    timeZone: tz,
    dateStyle: "long",
    timeStyle: "short",
  });

  const pdfProps = {
    clientName,
    clientEmail: b.clients?.email as string,
    artistName: (b.artists?.name ?? "Artist") as string,
    sessionType: b.session_types?.name as string,
    date: formatDate(b.starts_at, tz),
    time: formatTime(b.starts_at, tz),
    placement: b.placement as string | null,
    sizeEstimate: b.size_estimate as string | null,
    medicalNotes: b.medical_notes as string | null,
    signedAt,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  };
  // @ts-expect-error - React PDF types don't align with React's JSX element types
  const pdfBuffer = await renderToBuffer(React.createElement(ConsentFormPDF, pdfProps));

  const storagePath = `${bookingId}/consent.pdf`;
  const { error: uploadError } = await adminClient.storage
    .from("consent-pdfs")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    console.error("[consent/pdf] Upload failed:", uploadError);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  await adminClient.from("bookings").update({
    consent_form_pdf_url: storagePath,
  }).eq("id", bookingId);

  return NextResponse.json({ ok: true, path: storagePath });
}
