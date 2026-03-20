import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase
    .from("artists")
    .select("id, name, slug, subscription_status, trial_ends_at")
    .single();

  if (!artist) redirect("/sign-in");
  if (!artist.name) redirect("/onboarding");

  const trialDaysLeft =
    artist.subscription_status === "trial"
      ? Math.max(0, Math.ceil((new Date(artist.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar artist={artist} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardTopbar artist={artist} trialDaysLeft={trialDaysLeft} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
