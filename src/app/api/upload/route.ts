import { NextResponse } from "next/server";
import { adminClient } from "@/lib/supabase/admin";
import { BUCKETS } from "@/lib/supabase/storage";
import { verifyToken } from "@/lib/utils/tokens";

// Single signed upload URL (for reference images during booking, portfolio images)
export async function POST(request: Request) {
  const body = await request.json();

  // Batch upload for healed photos (unauthenticated, uses HMAC token)
  if (body.bucket === BUCKETS.HEALED_PHOTOS && body.token && body.files) {
    const bookingId = verifyToken(body.token);
    if (!bookingId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const files: Array<{ name: string; type: string }> = body.files;
    if (!files.length || files.length > 5) {
      return NextResponse.json({ error: "Provide 1–5 files" }, { status: 400 });
    }

    const uploadUrls: Array<{ signedUrl: string; path: string }> = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${bookingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await adminClient.storage
        .from(BUCKETS.HEALED_PHOTOS)
        .createSignedUploadUrl(path);
      if (error || !data) {
        return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
      }
      uploadUrls.push({ signedUrl: data.signedUrl, path });
    }

    return NextResponse.json({ uploadUrls });
  }

  // Single upload (reference images, portfolio)
  const { bucket, path } = body;
  const allowedBuckets = [BUCKETS.REFERENCE_IMAGES, BUCKETS.PORTFOLIO];
  if (!allowedBuckets.includes(bucket)) {
    return NextResponse.json({ error: "Invalid bucket" }, { status: 400 });
  }

  const { data, error } = await adminClient.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl, token: data.token });
}
