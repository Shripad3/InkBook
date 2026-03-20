import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InkBook — Tattoo Booking Platform",
    template: "%s | InkBook",
  },
  description:
    "The only booking platform built exactly for tattoo artists. Deposits, consent forms, aftercare — all automated.",
  keywords: ["tattoo booking", "tattoo artist", "book tattoo", "tattoo studio"],
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "InkBook",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased min-h-screen`}>
        {children}
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(0 0% 10%)",
              border: "1px solid hsl(0 0% 18%)",
              color: "hsl(0 0% 98%)",
            },
          }}
        />
      </body>
    </html>
  );
}
