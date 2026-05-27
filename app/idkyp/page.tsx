import type { Metadata } from "next";
import IdkypClient from "./IdkypClient";

export const metadata: Metadata = {
  title: "IDKYP — PartyTab",
  description: "I don't know, you pick. Decide where to eat without the back-and-forth.",
  robots: { index: false },
};

export default function IdkypPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <IdkypClient />
    </div>
  );
}
