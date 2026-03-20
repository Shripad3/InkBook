import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Clients" };

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id").single();
  if (!artist) redirect("/sign-in");

  // Get all unique clients for this artist via bookings
  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select(`
      id, starts_at, deposit_amount, deposit_paid,
      clients:client_id (id, first_name, last_name, email, phone, is_no_show_flagged, no_show_count, created_at)
    `)
    .eq("artist_id", artist.id)
    .in("status", ["confirmed", "completed", "no_show"]);
  const bookings = bookingsRaw as unknown as Array<{
    id: string;
    starts_at: string;
    deposit_amount: number;
    deposit_paid: boolean;
    clients: { id: string; first_name: string; last_name: string; email: string; phone: string | null; is_no_show_flagged: boolean; no_show_count: number } | null;
  }> | null;

  // Aggregate per client
  const clientMap = new Map<string, {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    is_no_show_flagged: boolean;
    no_show_count: number;
    bookingCount: number;
    totalSpent: number;
    lastBooking: string | null;
  }>();

  for (const b of bookings ?? []) {
    const c = b.clients;
    if (!c) continue;
    if (!clientMap.has(c.id)) {
      clientMap.set(c.id, {
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
        is_no_show_flagged: c.is_no_show_flagged,
        no_show_count: c.no_show_count,
        bookingCount: 0,
        totalSpent: 0,
        lastBooking: null,
      });
    }
    const entry = clientMap.get(c.id)!;
    entry.bookingCount++;
    if (b.deposit_paid) entry.totalSpent += b.deposit_amount;
    if (!entry.lastBooking || b.starts_at > entry.lastBooking) {
      entry.lastBooking = b.starts_at;
    }
  }

  const clients = Array.from(clientMap.values()).sort((a, b) =>
    (b.lastBooking ?? "") > (a.lastBooking ?? "") ? 1 : -1
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clients ({clients.length})</h1>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Bookings</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Total spent</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Last booking</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Flags</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No clients yet.
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-b border-border hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <Link href={`/dashboard/clients/${client.id}`} className="hover:text-[#c9a84c]">
                      <p className="font-medium">{client.first_name} {client.last_name}</p>
                      <p className="text-xs text-muted-foreground">{client.email}</p>
                    </Link>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                    {client.bookingCount}
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    €{client.totalSpent.toFixed(0)}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                    {client.lastBooking ? format(new Date(client.lastBooking), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {client.is_no_show_flagged && (
                      <span className="flex items-center gap-1 text-amber-400 text-xs">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        No-show × {client.no_show_count}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
