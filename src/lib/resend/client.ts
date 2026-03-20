import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY ?? "re_placeholder");

export const FROM_EMAIL = "InkBook <notifications@inkbook.io>";
export const FROM_ARTIST_EMAIL = (name: string) => `${name} via InkBook <notifications@inkbook.io>`;
