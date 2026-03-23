import { adminClient } from "@/lib/supabase/admin";
import { resend, FROM_EMAIL, FROM_ARTIST_EMAIL } from "@/lib/resend/client";
import { sendSMS, buildSMS24h, buildSMS3h } from "@/lib/twilio/messages";
import { BookingConfirmationEmail } from "@/lib/resend/templates/BookingConfirmation";
import { ArtistNewBookingEmail } from "@/lib/resend/templates/ArtistNewBooking";
import { PrepReminderEmail } from "@/lib/resend/templates/PrepReminder";
import { ConsentFormLinkEmail } from "@/lib/resend/templates/ConsentFormLink";
import { AftercareEmail } from "@/lib/resend/templates/Aftercare";
import { HealedPhotoRequestEmail } from "@/lib/resend/templates/HealedPhotoRequest";
import { formatDate, formatTime } from "@/lib/utils/date";
import { formatCurrency } from "@/lib/utils/currency";
import { createToken } from "@/lib/utils/tokens";
import { render } from "@react-email/render";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://inkbook.io";

type NotificationRow = {
  id: string;
  booking_id: string;
  type: string;
  channel: string;
};

type BookingData = {
  id: string;
  starts_at: string;
  ends_at: string;
  deposit_amount: number;
  consent_form_signed_at: string | null;
  clients: { email: string; first_name: string; last_name: string; phone: string | null };
  artists: { id: string; name: string | null; slug: string; timezone: string; user_id: string };
  session_types: { name: string };
};

async function fetchBooking(bookingId: string): Promise<BookingData | null> {
  const { data } = await adminClient
    .from("bookings")
    .select(`
      id, starts_at, ends_at, deposit_amount, consent_form_signed_at,
      clients:client_id (email, first_name, last_name, phone),
      artists:artist_id (id, name, slug, timezone, user_id),
      session_types:session_type_id (name)
    `)
    .eq("id", bookingId)
    .single();
  return data as unknown as BookingData | null;
}

async function getArtistEmail(userId: string): Promise<string | null> {
  const { data } = await adminClient.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

async function dispatch(notification: NotificationRow): Promise<void> {
  const booking = await fetchBooking(notification.booking_id);
  if (!booking) throw new Error("Booking not found");

  const { clients: client, artists: artist, session_types: sessionType } = booking;
  const clientName = `${client.first_name} ${client.last_name}`;
  const artistName = artist.name ?? "your artist";
  const tz = artist.timezone;
  const date = formatDate(booking.starts_at, tz);
  const time = formatTime(booking.starts_at, tz);

  switch (notification.type) {
    case "deposit_paid_client": {
      if (notification.channel === "email") {
        const html = await render(BookingConfirmationEmail({
          clientName, artistName, sessionType: sessionType.name,
          date, time, depositAmount: formatCurrency(booking.deposit_amount),
        }));
        await resend.emails.send({
          from: FROM_EMAIL,
          to: client.email,
          subject: `Your booking with ${artistName} is confirmed`,
          html,
        });
      } else if (notification.channel === "sms" && client.phone) {
        await sendSMS(
          client.phone,
          `Hi ${client.first_name}! Your ${sessionType.name} session with ${artistName} is confirmed for ${date} at ${time}. Deposit received!`
        );
      }
      break;
    }

    case "deposit_paid_artist": {
      const artistEmail = await getArtistEmail(artist.user_id);
      if (artistEmail) {
        const html = await render(ArtistNewBookingEmail({
          artistName, clientName, sessionType: sessionType.name,
          date, time, depositAmount: formatCurrency(booking.deposit_amount),
          dashboardUrl: `${APP_URL}/dashboard/bookings/${booking.id}`,
        }));
        await resend.emails.send({
          from: FROM_EMAIL,
          to: artistEmail,
          subject: `New booking confirmed — ${clientName}`,
          html,
        });
      }
      break;
    }

    case "prep_reminder_48h": {
      const html = await render(PrepReminderEmail({ clientName, artistName, date, time }));
      await resend.emails.send({
        from: FROM_ARTIST_EMAIL(artistName),
        to: client.email,
        subject: `Your appointment is in 48 hours — ${date} at ${time}`,
        html,
      });
      break;
    }

    case "consent_reminder_24h": {
      if (!booking.consent_form_signed_at) {
        const token = createToken(booking.id, 30);
        const consentUrl = `${APP_URL}/consent/${token}`;
        const html = await render(ConsentFormLinkEmail({ clientName, artistName, date, time, consentUrl }));
        await resend.emails.send({
          from: FROM_ARTIST_EMAIL(artistName),
          to: client.email,
          subject: `Action required: Sign your consent form for ${date}`,
          html,
        });
      }
      break;
    }

    case "sms_24h": {
      if (client.phone) {
        await sendSMS(client.phone, buildSMS24h(client.first_name, artistName, time));
      }
      break;
    }

    case "sms_3h": {
      if (client.phone) {
        await sendSMS(client.phone, buildSMS3h(client.first_name, artistName));
      }
      break;
    }

    case "aftercare": {
      const html = await render(AftercareEmail({ clientName, artistName }));
      await resend.emails.send({
        from: FROM_ARTIST_EMAIL(artistName),
        to: client.email,
        subject: `Your aftercare guide from ${artistName}`,
        html,
      });
      break;
    }

    case "healed_photo_request": {
      const token = createToken(booking.id, 90);
      const html = await render(HealedPhotoRequestEmail({
        clientName, artistName, submitUrl: `${APP_URL}/healed/${token}`,
      }));
      await resend.emails.send({
        from: FROM_ARTIST_EMAIL(artistName),
        to: client.email,
        subject: `How's your tattoo healing? 📸`,
        html,
      });
      break;
    }

    default:
      throw new Error(`Unknown notification type: ${notification.type}`);
  }
}

export async function processScheduledNotifications(): Promise<{ processed: number; failed: number }> {
  // Fetch due notifications and immediately mark them as sent to prevent double dispatch
  // from concurrent cron invocations
  const { data: due, error } = await adminClient
    .from("notification_log")
    .select("id, booking_id, type, channel")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .is("sent_at", null)
    .limit(100);

  if (error) throw error;
  if (!due || due.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const notification of due as NotificationRow[]) {
    try {
      await dispatch(notification);
      await adminClient.from("notification_log").update({
        status: "sent",
        sent_at: new Date().toISOString(),
      }).eq("id", notification.id);
      processed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await adminClient.from("notification_log").update({
        status: "failed",
        error_message: message,
      }).eq("id", notification.id);
      console.error(`[notifications] ${notification.type} (${notification.id}) failed:`, err);
      failed++;
    }
  }

  return { processed, failed };
}
