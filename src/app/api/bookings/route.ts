import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { addMinutes } from "date-fns";
import { parseISO } from "date-fns";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    artistId,
    sessionTypeId,
    startsAt,
    // Client info
    firstName,
    lastName,
    email,
    phone,
    // Booking details
    placement,
    sizeEstimate,
    styleDescription,
    isCoverup,
    coverupDescription,
    medicalNotes,
    // Reference image paths already uploaded
    referenceImagePaths,
  } = body;

  // Validate required
  if (!artistId || !sessionTypeId || !startsAt || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch session type for deposit + duration
  const { data: sessionType } = await adminClient
    .from("session_types")
    .select("*")
    .eq("id", sessionTypeId)
    .single();

  if (!sessionType) {
    return NextResponse.json({ error: "Session type not found" }, { status: 404 });
  }

  // Upsert client by email
  const { data: existingClient } = await adminClient
    .from("clients")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  let client = existingClient;

  if (!client) {
    const { data: newClient, error: clientError } = await adminClient
      .from("clients")
      .insert({
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        phone: phone ?? null,
      })
      .select()
      .single();

    if (clientError || !newClient) {
      return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
    }
    client = newClient;
  } else {
    // Update name/phone in case they changed
    await adminClient
      .from("clients")
      .update({ first_name: firstName, last_name: lastName, phone: phone ?? null })
      .eq("id", client.id);
  }

  // Calculate deposit
  let depositAmount = 0;
  if (client.is_no_show_flagged) {
    // No-show clients always pay 50%
    const basePrice = sessionType.price_from ?? 0;
    depositAmount = basePrice * 0.5;
  } else if (sessionType.deposit_type === "fixed") {
    depositAmount = sessionType.deposit_value;
  } else {
    const basePrice = sessionType.price_from ?? 0;
    depositAmount = basePrice * (sessionType.deposit_value / 100);
  }

  // Calculate ends_at
  const start = parseISO(startsAt);
  const endsAt = addMinutes(start, sessionType.duration_minutes + sessionType.buffer_minutes);

  // Create booking
  const { data: booking, error: bookingError } = await adminClient
    .from("bookings")
    .insert({
      artist_id: artistId,
      session_type_id: sessionTypeId,
      client_id: client.id,
      starts_at: startsAt,
      ends_at: endsAt.toISOString(),
      status: "pending_deposit",
      placement: placement ?? null,
      size_estimate: sizeEstimate ?? null,
      style_description: styleDescription ?? null,
      is_coverup: isCoverup ?? false,
      coverup_description: coverupDescription ?? null,
      medical_notes: medicalNotes ?? null,
      deposit_amount: depositAmount,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  // Save reference images
  if (referenceImagePaths?.length) {
    await adminClient.from("reference_images").insert(
      referenceImagePaths.map((path: string) => ({
        booking_id: booking.id,
        storage_path: path,
      }))
    );
  }

  // Schedule booking_created notification
  await adminClient.from("notification_log").insert({
    booking_id: booking.id,
    type: "booking_created",
    channel: "email",
    status: "pending",
  });

  return NextResponse.json({ bookingId: booking.id, depositAmount });
}
