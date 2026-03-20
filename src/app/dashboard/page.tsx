import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, Users, Clock } from "lucide-react";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id, timezone").single();
  if (!artist) redirect("/sign-in");

  // Stats for this month
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: monthBookings } = await supabase
    .from("bookings")
    .select("id, deposit_amount, status, deposit_paid")
    .eq("artist_id", artist.id)
    .gte("created_at", monthStart.toISOString())
    .in("status", ["confirmed", "completed"]);

  const { data: upcomingRaw } = await supabase
    .from("bookings")
    .select(`
      id, starts_at, status,
      clients:client_id (first_name, last_name),
      session_types:session_type_id (name)
    `)
    .eq("artist_id", artist.id)
    .gte("starts_at", new Date().toISOString())
    .in("status", ["confirmed"])
    .order("starts_at")
    .limit(5);
  const upcomingBookings = upcomingRaw as unknown as Array<{
    id: string;
    starts_at: string;
    status: string;
    clients: { first_name: string; last_name: string } | null;
    session_types: { name: string } | null;
  }> | null;

  const { data: pendingDeposit } = await supabase
    .from("bookings")
    .select("id")
    .eq("artist_id", artist.id)
    .eq("status", "pending_deposit");

  const totalRevenue = (monthBookings ?? []).reduce(
    (sum, b) => sum + (b.deposit_paid ? b.deposit_amount : 0),
    0
  );

  const stats = [
    {
      title: "Bookings this month",
      value: monthBookings?.length ?? 0,
      icon: CalendarDays,
      description: "Confirmed or completed",
    },
    {
      title: "Revenue (deposits)",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      description: "Month to date",
    },
    {
      title: "Pending deposits",
      value: pendingDeposit?.length ?? 0,
      icon: Clock,
      description: "Awaiting payment",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm">Welcome back.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {!upcomingBookings?.length ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No upcoming appointments. Share your booking link to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const client = booking.clients as { first_name: string; last_name: string } | null;
                const sessionType = booking.session_types as { name: string } | null;
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {client?.first_name} {client?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{sessionType?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#c9a84c]">
                        {format(new Date(booking.starts_at), "EEE d MMM")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(booking.starts_at), "h:mm a")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
