import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) return NextResponse.json({ client: null });

  const { data } = await adminClient
    .from("clients")
    .select("id, is_no_show_flagged, no_show_count")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  return NextResponse.json({ client: data });
}
