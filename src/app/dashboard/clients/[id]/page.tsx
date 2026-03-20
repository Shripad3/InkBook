import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/currency";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id").single();
  if (!artist) redirect("/sign-in");

  // Verify this client belongs to this artist
  const { data: client } = await adminClient
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: bookingsRaw } = await adminClient
    .from("bookings")
    .select(`*, session_types:session_type_id (name)`)
    .eq("artist_id", artist.id)
    .eq("client_id", id)
    .order("starts_at", { ascending: false });
  const bookings = bookingsRaw as unknown as Array<{
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    deposit_paid: boolean;
    deposit_amount: number;
    session_types: { name: string } | null;
  }> | null;

  const totalSpent = (bookings ?? [])
    .filter((b) => b.deposit_paid)
    .reduce((sum, b) => sum + b.deposit_amount, 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{client.first_name} {client.last_name}</h1>
          {client.is_no_show_flagged && (
            <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>No-show flag ({client.no_show_count}×)</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total spent</p>
          <p className="text-xl font-bold text-[#c9a84c]">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {/* Contact info */}
      <Card>
        <CardContent className="pt-6 space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${client.email}`} className="hover:text-[#c9a84c]">{client.email}</a>
          </div>
          {client.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${client.phone}`} className="hover:text-[#c9a84c]">{client.phone}</a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking history ({bookings?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookings?.length ? (
            <p className="text-sm text-muted-foreground">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const st = b.session_types as { name: string } | null;
                return (
                  <Link
                    key={b.id}
                    href={`/dashboard/bookings/${b.id}`}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0 hover:text-[#c9a84c] transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm">{st?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(b.starts_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge status={b.status as any} />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
