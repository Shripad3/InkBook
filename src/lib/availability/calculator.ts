import { addMinutes, parseISO, isAfter, isBefore, startOfDay, endOfDay, getDay } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

export interface TimeSlot {
  startsAt: Date;   // UTC
  endsAt: Date;     // UTC
  label: string;    // formatted in artist tz
}

interface WorkingHour {
  day_of_week: number;
  start_time: string; // "HH:MM"
  end_time: string;
  is_available: boolean;
}

interface ExistingBooking {
  starts_at: string;
  ends_at: string;
  session_type_id: string;
}

interface BlockedTime {
  starts_at: string;
  ends_at: string;
}

interface SessionType {
  duration_minutes: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_advance_days: number;
}

function parseTimeOnDate(date: Date, timeStr: string, tz: string): Date {
  const [h, m] = timeStr.split(":").map(Number);
  const zonedDate = toZonedTime(date, tz);
  zonedDate.setHours(h, m, 0, 0);
  return fromZonedTime(zonedDate, tz);
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return isBefore(aStart, bEnd) && isAfter(aEnd, bStart);
}

export function computeAvailableSlots({
  date,
  sessionType,
  workingHours,
  existingBookings,
  blockedTimes,
  artistTimezone,
}: {
  date: Date; // UTC midnight of the requested date
  sessionType: SessionType;
  workingHours: WorkingHour[];
  existingBookings: ExistingBooking[];
  blockedTimes: BlockedTime[];
  artistTimezone: string;
}): TimeSlot[] {
  const now = new Date();

  // Get day of week in artist's timezone
  const zonedDate = toZonedTime(date, artistTimezone);
  const dayOfWeek = getDay(zonedDate);

  const wh = workingHours.find((w) => w.day_of_week === dayOfWeek);
  if (!wh || !wh.is_available) return [];

  const workStart = parseTimeOnDate(date, wh.start_time, artistTimezone);
  const workEnd = parseTimeOnDate(date, wh.end_time, artistTimezone);

  const { duration_minutes, buffer_minutes, min_notice_hours, max_advance_days } = sessionType;
  const slotDuration = duration_minutes + buffer_minutes;

  // Check advance days limit
  const maxDate = addMinutes(now, max_advance_days * 24 * 60);
  if (isAfter(date, maxDate)) return [];

  // Min notice: earliest slot start
  const minStart = addMinutes(now, min_notice_hours * 60);

  // Build slots
  const slots: TimeSlot[] = [];
  let slotStart = new Date(workStart);

  while (true) {
    const slotEnd = addMinutes(slotStart, slotDuration);
    if (isAfter(slotEnd, workEnd)) break;

    // Check min notice
    if (isAfter(minStart, slotStart)) {
      slotStart = addMinutes(slotStart, duration_minutes);
      continue;
    }

    // Check overlap with existing bookings
    const hasBookingConflict = existingBookings.some((b) => {
      const bStart = parseISO(b.starts_at);
      const bEnd = parseISO(b.ends_at);
      // bEnd already includes buffer from when it was stored
      return overlaps(slotStart, slotEnd, bStart, bEnd);
    });

    if (hasBookingConflict) {
      slotStart = addMinutes(slotStart, duration_minutes);
      continue;
    }

    // Check overlap with blocked times
    const hasBlockConflict = blockedTimes.some((bt) => {
      return overlaps(slotStart, slotEnd, parseISO(bt.starts_at), parseISO(bt.ends_at));
    });

    if (hasBlockConflict) {
      slotStart = addMinutes(slotStart, duration_minutes);
      continue;
    }

    // Valid slot — format time in artist timezone
    const zonedSlotStart = toZonedTime(slotStart, artistTimezone);
    const label = zonedSlotStart.toLocaleTimeString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: artistTimezone,
    });

    slots.push({
      startsAt: new Date(slotStart),
      endsAt: new Date(addMinutes(slotStart, duration_minutes)), // store without buffer
      label,
    });

    slotStart = addMinutes(slotStart, duration_minutes);
  }

  return slots;
}
