import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format, startOfWeek, endOfWeek, addWeeks, eachDayOfInterval } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Calendar" };

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: artist } = await supabase.from("artists").select("id, timezone").single();
  if (!artist) redirect("/sign-in");

  const params = await searchParams;
  const weekOffset = parseInt(params.week ?? "0", 10);
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: bookingsRaw } = await supabase
    .from("bookings")
    .select(`
      id, starts_at, ends_at, status,
      clients:client_id (first_name, last_name),
      session_types:session_type_id (name)
    `)
    .eq("artist_id", artist.id)
    .gte("starts_at", weekStart.toISOString())
    .lte("starts_at", weekEnd.toISOString())
    .in("status", ["confirmed", "pending_deposit", "completed"]);
  const bookings = bookingsRaw as unknown as Array<{
    id: string;
    starts_at: string;
    ends_at: string;
    status: string;
    clients: { first_name: string; last_name: string } | null;
    session_types: { name: string } | null;
  }> | null;

  const STATUS_COLORS: Record<string, string> = {
    confirmed: "bg-[#c9a84c]/20 border-l-2 border-[#c9a84c] text-[#c9a84c]",
    pending_deposit: "bg-amber-500/20 border-l-2 border-amber-500 text-amber-400",
    completed: "bg-emerald-500/10 border-l-2 border-emerald-500 text-emerald-400",
  };

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/calendar?week=${weekOffset - 1}`}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
          >
            ←
          </Link>
          <span className="text-sm text-muted-foreground">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </span>
          <Link
            href={`/dashboard/calendar?week=${weekOffset + 1}`}
            className="px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
          >
            →
          </Link>
          {weekOffset !== 0 && (
            <Link
              href="/dashboard/calendar"
              className="px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
            >
              Today
            </Link>
          )}
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const dayBookings = (bookings ?? []).filter(
            (b) => format(new Date(b.starts_at), "yyyy-MM-dd") === dayStr
          );
          const isToday = format(new Date(), "yyyy-MM-dd") === dayStr;

          return (
            <div key={dayStr} className="min-h-32">
              {/* Day header */}
              <div className={`text-center py-2 rounded-t-lg mb-1 ${isToday ? "bg-[#c9a84c]/10" : ""}`}>
                <p className="text-xs text-muted-foreground">{format(day, "EEE")}</p>
                <p
                  className={`text-sm font-semibold ${
                    isToday ? "text-[#c9a84c]" : ""
                  }`}
                >
                  {format(day, "d")}
                </p>
              </div>

              {/* Bookings */}
              <div className="space-y-1">
                {dayBookings.map((b) => {
                  const client = b.clients as { first_name: string; last_name: string } | null;
                  const colorClass = STATUS_COLORS[b.status] ?? "bg-muted";
                  return (
                    <Link
                      key={b.id}
                      href={`/dashboard/bookings/${b.id}`}
                      className={`block px-2 py-1 rounded text-xs ${colorClass} hover:opacity-80 transition-opacity`}
                    >
                      <p className="font-medium truncate">
                        {client?.first_name} {client?.last_name?.[0]}.
                      </p>
                      <p className="opacity-80">
                        {format(new Date(b.starts_at), "h:mm a")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
