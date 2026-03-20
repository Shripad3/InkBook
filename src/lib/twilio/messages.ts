import { twilioClient, FROM_NUMBER } from "./client";

export async function sendSMS(to: string, message: string): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      from: FROM_NUMBER,
      to,
      body: message,
    });
    return true;
  } catch (err) {
    console.error("SMS send error:", err);
    return false;
  }
}

export function buildSMS24h(clientName: string, artistName: string, time: string): string {
  return `Hi ${clientName}! Reminder: your tattoo appointment is tomorrow at ${time} with ${artistName}. Remember to eat beforehand, stay hydrated, and wear loose clothing. See you then!`;
}

export function buildSMS3h(clientName: string, artistName: string): string {
  return `Hi ${clientName}! See you soon — ${artistName} is looking forward to your session today. Don't forget to eat something before you come in! 🎨`;
}

export function buildConsentReminderSMS(clientName: string, consentUrl: string): string {
  return `Hi ${clientName}, don't forget to sign your consent form before your tattoo appointment: ${consentUrl}`;
}
