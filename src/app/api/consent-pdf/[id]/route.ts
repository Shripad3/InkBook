import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: bookingId } = await params;

  // Verify artist owns this booking
  const { data: artist } = await adminClient
    .from("artists")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!artist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: booking } = await adminClient
    .from("bookings")
    .select("consent_form_pdf_url")
    .eq("id", bookingId)
    .eq("artist_id", artist.id)
    .single();

  if (!booking?.consent_form_pdf_url) {
    return NextResponse.json({ error: "No consent PDF available" }, { status: 404 });
  }

  const { data: signedUrlData, error } = await adminClient.storage
    .from("consent-pdfs")
    .createSignedUrl(booking.consent_form_pdf_url, 300); // 5 min expiry

  if (error || !signedUrlData) {
    return NextResponse.json({ error: "Could not generate download link" }, { status: 500 });
  }

  return NextResponse.redirect(signedUrlData.signedUrl);
}
