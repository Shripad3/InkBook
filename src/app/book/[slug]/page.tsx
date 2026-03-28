import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { getSignedUrl, BUCKETS } from "@/lib/supabase/storage";
import { BookingWizard } from "@/components/booking/BookingWizard";
import type { Metadata } from "next";
import { Instagram } from "lucide-react";

export const revalidate = 60;
export const dynamicParams = true;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await adminClient
    .from("artists")
    .select("slug")
    .not("completed_onboarding_at", "is", null);
  return (data ?? []).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data: artist } = await adminClient
    .from("artists")
    .select("name, bio, studio_name")
    .eq("slug", slug)
    .not("completed_onboarding_at", "is", null)
    .single();

  if (!artist) return { title: "Artist Not Found" };

  return {
    title: `Book ${artist.name} — Tattoo Artist`,
    description: artist.bio ?? `Book a tattoo session with ${artist.name}${artist.studio_name ? ` at ${artist.studio_name}` : ""}`,
  };
}

export default async function BookingPage({ params }: Props) {
  const { slug } = await params;

  const { data: artist } = await adminClient
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .not("completed_onboarding_at", "is", null)
    .single();

  if (!artist) notFound();

  const { data: sessionTypes } = await adminClient
    .from("session_types")
    .select("*")
    .eq("artist_id", artist.id)
    .eq("is_active", true)
    .order("created_at");

  const { data: portfolioImages } = await adminClient
    .from("portfolio_images")
    .select("*")
    .eq("artist_id", artist.id)
    .order("display_order");

  // Generate signed URLs for portfolio
  const portfolioWithUrls = await Promise.all(
    (portfolioImages ?? []).map(async (img) => ({
      ...img,
      signedUrl: await getSignedUrl(BUCKETS.PORTFOLIO, img.storage_path),
    }))
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Artist header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar placeholder */}
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center shrink-0 text-2xl font-bold text-muted-foreground">
              {artist.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold">{artist.name}</h1>
              {artist.studio_name && (
                <p className="text-muted-foreground text-sm">{artist.studio_name}</p>
              )}
              {artist.instagram_handle && (
                <a
                  href={`https://instagram.com/${artist.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#c9a84c] hover:underline mt-1"
                >
                  <Instagram className="h-3.5 w-3.5" />
                  {artist.instagram_handle}
                </a>
              )}
              {artist.bio && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-prose">
                  {artist.bio}
                </p>
              )}
              {(artist.style_tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(artist.style_tags ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs rounded-full border border-[#c9a84c]/30 text-[#c9a84c]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Portfolio gallery */}
      {portfolioWithUrls.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {portfolioWithUrls.slice(0, 5).map((img) =>
                img.signedUrl ? (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.signedUrl}
                      alt="Portfolio"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* Booking wizard */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <BookingWizard
          artist={artist}
          sessionTypes={sessionTypes ?? []}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
          Booking powered by{" "}
          <a href="/" className="text-[#c9a84c] hover:underline">
            InkBook
          </a>
        </div>
      </footer>
    </div>
  );
}
