import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: booking } = await adminClient
    .from("bookings")
    .select(`
      *,
      artists:artist_id (id, name, slug, timezone),
      clients:client_id (id, email, first_name, last_name, phone, is_no_show_flagged),
      session_types:session_type_id (id, name, duration_minutes, price_from)
    `)
    .eq("id", id)
    .single();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ booking });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { status, artistNotes, deposit_paid } = body;

  // Verify artist owns this booking
  const { data: bookingData } = await adminClient
    .from("bookings")
    .select("*, artists:artist_id(user_id), clients:client_id(*)")
    .eq("id", id)
    .single();
  const booking = bookingData as unknown as { artists: { user_id: string }; clients: { id: string; no_show_count: number } } | null;

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (booking.artists.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (artistNotes !== undefined) updates.artist_notes = artistNotes;
  if (deposit_paid !== undefined) updates.deposit_paid = deposit_paid;

  const { data: updated, error } = await adminClient
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Handle no-show flagging
  if (status === "no_show") {
    const client = booking.clients;
    await adminClient
      .from("clients")
      .update({
        is_no_show_flagged: true,
        no_show_count: (client.no_show_count ?? 0) + 1,
      })
      .eq("id", client.id);
  }

  return NextResponse.json({ booking: updated });
}
