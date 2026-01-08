"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { InstallAppButton } from "./InstallAppButton";

type AuthStatus = "loading" | "signed_out" | "guest" | "basic" | "pro";

export function Header() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.user?.id) {
          setAuthStatus("signed_out");
        } else if (data.user.authProvider === "GUEST") {
          setAuthStatus("guest");
        } else if (data.user.subscriptionTier === "PRO") {
          setAuthStatus("pro");
        } else {
          setAuthStatus("basic");
        }
      })
      .catch(() => {
        setAuthStatus("signed_out");
      });
  }, [pathname]);

  // Show upgrade for signed-in users, login for signed-out
  const isSignedIn = authStatus === "guest" || authStatus === "basic" || authStatus === "pro";

  return (
    <header className="border-b border-ink-100 bg-sand-50/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PartyTab
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {isSignedIn ? (
            <Link
              href="/tabs"
              className="hidden animate-subtle-pulse rounded-full bg-green-600 px-4 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md sm:inline-block"
            >
              Keep the party going →
            </Link>
          ) : (
            <Link href="/tabs" className="hidden text-ink-500 hover:text-ink-700 sm:inline">
              Keep the party going.
            </Link>
          )}
          <InstallAppButton />
          {authStatus === "signed_out" && (
            <Link href="/login" className="font-medium text-green-700 hover:text-green-800">
              Login
            </Link>
          )}
          {isSignedIn && (
            <Link href="/upgrade" className="font-medium text-green-700 hover:text-green-800">
              Upgrade
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
