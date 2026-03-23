import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingsTable } from "@/components/bookings/BookingsTable";
import type { BookingStatus } from "@/types/database";

type BookingListItem = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  deposit_paid: boolean;
  deposit_amount: number;
  consent_form_signed_at: string | null;
  clients: { first_name: string; last_name: string; email: string } | null;
  session_types: { name: string } | null;
};

export const metadata = { title: "Bookings" };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id, timezone").single();
  if (!artist) redirect("/sign-in");

  const params = await searchParams;
  const statusFilter = params.status;

  let query = supabase
    .from("bookings")
    .select(`
      id, starts_at, ends_at, status, deposit_paid, deposit_amount,
      consent_form_signed_at,
      clients:client_id (first_name, last_name, email),
      session_types:session_type_id (name)
    `)
    .eq("artist_id", artist.id)
    .order("starts_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter as BookingStatus);
  }

  const { data: bookingsRaw } = await query.limit(50);
  const bookings = bookingsRaw as unknown as BookingListItem[] | null;

  const STATUS_TABS = [
    { value: "all", label: "All" },
    { value: "pending_deposit", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "no_show", label: "No-show" },
    { value: "cancelled_artist", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Bookings</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/bookings?status=${tab.value}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              (statusFilter ?? "all") === tab.value
                ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]"
                : "border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <BookingsTable bookings={bookings ?? []} />
    </div>
  );
}
