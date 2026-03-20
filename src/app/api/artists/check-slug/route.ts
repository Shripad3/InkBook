import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) return NextResponse.json({ available: false });

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug) || slug.length < 3) {
    return NextResponse.json({
      available: false,
      error: "Slug must be at least 3 characters and contain only lowercase letters, numbers, and hyphens",
    });
  }

  const { data } = await adminClient
    .from("artists")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ available: !data });
}
