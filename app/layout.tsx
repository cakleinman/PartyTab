import type { Metadata } from "next";
import { Space_Grotesk, Work_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/app/components/ToastProvider";
import { Header } from "@/app/components/Header";
import { getEnvStatus } from "@/lib/env";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ProBanner } from "@/app/components/ProBanner";
import { JsonLdSchema } from "@/app/components/JsonLdSchema";

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PartyTab | Free Bill Splitting App - No Download Required",
  description:
    "Split group expenses for trips, dinners, and roommates. Track who paid what and settle up easily. Works in your browser—no app download needed. Free to use.",
  keywords: [
    "bill splitting app",
    "split expenses",
    "group expense tracker",
    "no app download",
    "free bill splitter",
    "trip expense splitter",
    "roommate expenses",
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png?v=2",
  },
  metadataBase: new URL("https://partytab.app"),
  openGraph: {
    title: "PartyTab - Split Group Expenses the Easy Way",
    description:
      "Track and share expenses with friends on trips, parties, and shared living. No app download required.",
    url: "https://partytab.app",
    siteName: "PartyTab",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PartyTab | Free Bill Splitting App",
    description:
      "Split group expenses—no app download needed. Track who paid what and settle up the smart way.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://partytab.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const envStatus = getEnvStatus();
  if (!envStatus.ok) {
    return (
      <html lang="en">
        <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
          <div className="min-h-screen bg-sand-50 text-ink-900">
            <main className="mx-auto w-full max-w-3xl px-6 py-16">
              <div className="rounded-3xl border border-sand-200 bg-white/80 p-8">
                <h1 className="text-2xl font-semibold">Environment setup required</h1>
                <p className="mt-2 text-sm text-ink-500">
                  Add the following variables to your <code>.env</code> file.
                </p>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-ink-700">
                  {envStatus.missing.map((key) => (
                    <li key={key}>{key}</li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-ink-500">
                  See <code>.env.example</code> for local defaults.
                </p>
              </div>
            </main>
          </div>
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <head>
        <JsonLdSchema />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable} antialiased`}>
        <div className="min-h-screen bg-sand-50 text-ink-900">
          <Header />
          <ProBanner />
          <ToastProvider>
            <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
          </ToastProvider>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
