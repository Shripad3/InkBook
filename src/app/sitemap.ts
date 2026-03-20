import { MetadataRoute } from "next";
import { adminClient } from "@/lib/supabase/admin";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.io";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.7,
    },
  ];

  const { data: artists } = await adminClient
    .from("artists")
    .select("slug, created_at")
    .not("completed_onboarding_at", "is", null);

  const artistRoutes: MetadataRoute.Sitemap = (artists ?? []).map((artist) => ({
    url: `${BASE_URL}/book/${artist.slug}`,
    lastModified: new Date(artist.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...artistRoutes];
}
