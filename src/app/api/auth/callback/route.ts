import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { adminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Create artist record if it doesn't exist
      const { data: existing } = await adminClient
        .from("artists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!existing) {
        // Generate slug from email
        const emailPrefix = user.email?.split("@")[0] ?? "artist";
        let slug = emailPrefix.toLowerCase().replace(/[^a-z0-9]/g, "-");

        // Ensure unique slug
        const { data: slugConflict } = await adminClient
          .from("artists")
          .select("id")
          .eq("slug", slug)
          .single();

        if (slugConflict) {
          slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }

        await adminClient.from("artists").insert({
          user_id: user.id,
          slug,
          subscription_status: "trial",
        });
      }

      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?message=auth-error`);
}
