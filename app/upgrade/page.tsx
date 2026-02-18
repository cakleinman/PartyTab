import type { Metadata } from "next";
import UpgradeClient from "./UpgradeClient";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders",
  description: "Compare PartyTab plans. Free bill splitting for everyone, or upgrade to Pro for AI receipt scanning, item-level claiming, and automated payment reminders.",
  openGraph: {
    title: "Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders",
    description: "Compare PartyTab plans. Free bill splitting for everyone, or upgrade to Pro for AI receipt scanning, item-level claiming, and automated payment reminders.",
    url: "https://partytab.app/upgrade",
    type: "website",
    images: OG_IMAGE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders",
    description: "Compare PartyTab plans. Free bill splitting for everyone, or upgrade to Pro for AI receipt scanning, item-level claiming, and automated payment reminders.",
    images: TWITTER_IMAGE,
  },
  alternates: {
    canonical: "https://partytab.app/upgrade",
  },
};

export default function UpgradePage() {
  return <UpgradeClient />;
}
