"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StartScreen } from "./components/StartScreen";
import type { Screen } from "@/lib/idkyp/types";

type AuthState = "loading" | "signed_out" | "signed_in";

export default function IdkypClient() {
  const [auth, setAuth] = useState<AuthState>("loading");
  const [screen, _setScreen] = useState<Screen>("start");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => setAuth(data?.user?.id ? "signed_in" : "signed_out"))
      .catch(() => setAuth("signed_out"));
  }, []);

  if (auth === "loading") {
    return <div className="text-ink-500">Loading…</div>;
  }

  if (auth === "signed_out") {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-ink-900">IDKYP</h1>
        <p className="mt-2 text-ink-500">I don&apos;t know, you pick. Sign in to use IDKYP.</p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  if (screen === "start") {
    return <StartScreen onBegin={() => _setScreen("map")} />;
  }

  return (
    <div className="rounded-2xl border border-sand-200 bg-white p-6">
      <p className="text-ink-500">IDKYP screens land in Phase 1.</p>
    </div>
  );
}
