import type { Metadata } from "next";
import UpgradeClient from "./UpgradeClient";

export const metadata: Metadata = {
  title: "Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders",
  description: "Compare PartyTab plans. Free bill splitting for everyone, or upgrade to Pro for AI receipt scanning, item-level claiming, and automated payment reminders.",
  openGraph: {
    title: "Upgrade to PartyTab Pro | Receipt Scanning & Payment Reminders",
    description: "Compare PartyTab plans. Free bill splitting for everyone, or upgrade to Pro for AI receipt scanning, item-level claiming, and automated payment reminders.",
    url: "https://partytab.app/upgrade",
  },
  alternates: {
    canonical: "https://partytab.app/upgrade",
  },
};

export default function UpgradePage() {
  return <UpgradeClient />;
}
