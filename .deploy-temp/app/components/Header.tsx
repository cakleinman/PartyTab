"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function Header() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        setIsSignedIn(!!data?.user?.id);
      })
      .catch(() => {
        setIsSignedIn(false);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="border-b border-ink-100 bg-sand-50/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <a href="/" className="text-lg font-semibold tracking-tight">
          PartyTab
        </a>
        <nav className="flex items-center gap-4 text-sm">
          <span className="hidden text-ink-500 sm:inline">Keep the party going.</span>
          {!loading && (
            isSignedIn ? (
              <button
                onClick={handleLogout}
                className="font-medium text-ink-700 hover:text-ink-900"
              >
                Log out
              </button>
            ) : (
              <a href="/signin" className="font-medium text-ink-700 hover:text-ink-900">
                Sign in
              </a>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
