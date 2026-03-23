"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/bookings/StatusBadge";
import type { BookingStatus } from "@/types/database";

type BookingListItem = {
  id: string;
  starts_at: string;
  status: string;
  deposit_paid: boolean;
  deposit_amount: number;
  consent_form_signed_at: string | null;
  clients: { first_name: string; last_name: string; email: string } | null;
  session_types: { name: string } | null;
};

export function BookingsTable({ bookings }: { bookings: BookingListItem[] }) {
  const router = useRouter();

  return (
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
          {!bookings.length ? (
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
                  onClick={() => router.push(`/dashboard/bookings/${booking.id}`)}
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium">{format(new Date(booking.starts_at), "MMM d, yyyy")}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(booking.starts_at), "h:mm a")}</p>
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
  );
}
