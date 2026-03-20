import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
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

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Session</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Deposit</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Consent</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {!bookings?.length ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((booking) => {
                const client = booking.clients;
                const sessionType = booking.session_types;
                return (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <Link href={`/dashboard/bookings/${booking.id}`} className="hover:text-[#c9a84c]">
                        <p className="font-medium">{format(new Date(booking.starts_at), "MMM d, yyyy")}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(booking.starts_at), "h:mm a")}</p>
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium">{client?.first_name} {client?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{client?.email}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                      {sessionType?.name}
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      {booking.deposit_paid ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <XCircle className="h-3.5 w-3.5" /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      {booking.consent_form_signed_at ? (
                        <span className="flex items-center gap-1 text-emerald-500 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Unsigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={booking.status as BookingStatus} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
