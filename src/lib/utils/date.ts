import { format, parseISO, addDays, addHours, subHours, differenceInDays } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";

export { formatInTimeZone, toZonedTime, fromZonedTime };

export function formatDate(date: Date | string, tz: string = "UTC"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, tz, "EEE, MMM d yyyy");
}

export function formatTime(date: Date | string, tz: string = "UTC"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, tz, "h:mm a");
}

export function formatDateTime(date: Date | string, tz: string = "UTC"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, tz, "EEE, MMM d yyyy 'at' h:mm a");
}

export function formatDateTimeShort(date: Date | string, tz: string = "UTC"): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(d, tz, "MMM d, h:mm a");
}

export { addDays, addHours, subHours, differenceInDays, format, parseISO };
