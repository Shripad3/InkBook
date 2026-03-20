import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/types/database";

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" | "secondary" | "gold" }> = {
  pending_deposit: { label: "Pending deposit", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "success" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled_artist: { label: "Cancelled", variant: "destructive" },
  cancelled_client: { label: "Cancelled (client)", variant: "destructive" },
  no_show: { label: "No-show", variant: "destructive" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config = STATUS_CONFIG[status] ?? { label: status, variant: "outline" };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
