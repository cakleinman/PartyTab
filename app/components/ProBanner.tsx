"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProBanner() {
  const [entitlementState, setEntitlementState] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user?.entitlementState) {
          setEntitlementState(data.user.entitlementState);
        }
      })
      .catch(() => {});
  }, [pathname]);

  if (entitlementState === "PRO_PAST_DUE") {
    return (
      <div className="bg-red-600 px-4 py-2 text-center text-sm font-medium text-white">
        <p>
          Your Pro subscription is past due.{" "}
          <Link
            href="/upgrade"
            className="underline underline-offset-2 hover:text-red-100"
          >
            Fix payment
          </Link>{" "}
          to keep your features.
        </p>
      </div>
    );
  }

  return null;
}
