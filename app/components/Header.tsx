"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { InstallAppButton } from "./InstallAppButton";
import { NotificationBell } from "./NotificationBell";

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
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PartyTab
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm">
          {isSignedIn ? (
            <Link
              href="/tabs"
              className={
                pathname === "/"
                  ? "animate-subtle-pulse rounded-full bg-green-600 px-3 py-1.5 font-medium text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md sm:px-4"
                  : "rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-sand-50"
              }
            >
              <span className="sm:hidden">My Tabs</span>
              <span className="hidden sm:inline">Keep the party going</span>
            </Link>
          ) : (
            <Link href="/tabs" className="hidden text-ink-500 hover:text-ink-700 sm:inline">
              Keep the party going.
            </Link>
          )}
          <InstallAppButton />
          {isSignedIn && <NotificationBell />}
          {isSignedIn && (
            <Link
              href="/settings"
              className="text-ink-400 hover:text-ink-700 transition"
              aria-label="Settings"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
          )}
          {authStatus === "signed_out" && (
            <Link href="/login" className="font-medium text-green-700 hover:text-green-800">
              Login
            </Link>
          )}
          {isSignedIn && (
            <Link href="/upgrade" className="font-medium text-green-700 hover:text-green-800">
              {authStatus === "pro" ? "Pro" : "Upgrade"}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
