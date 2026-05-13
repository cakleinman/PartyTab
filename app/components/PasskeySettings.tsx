"use client";

import { useCallback, useEffect, useState } from "react";
import { startRegistration, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useToast } from "@/app/components/ToastProvider";

type Passkey = {
  id: string;
  deviceName: string | null;
  createdAt: string;
  lastUsedAt: string | null;
};

function formatTimestamp(value: string | null): string {
  if (!value) return "never";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function PasskeySettings() {
  const { pushToast } = useToast();
  const [passkeys, setPasskeys] = useState<Passkey[] | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const supported = typeof window !== "undefined" && browserSupportsWebAuthn();

  const load = useCallback(async () => {
    const res = await fetch("/api/me/passkeys");
    if (!res.ok) return;
    const data = await res.json();
    setPasskeys(data.passkeys ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleEnrol = async () => {
    if (!supported) {
      pushToast("This browser doesn't support passkeys");
      return;
    }
    setEnrolling(true);
    try {
      const challengeRes = await fetch("/api/me/passkeys/enroll/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!challengeRes.ok) {
        const data = await challengeRes.json().catch(() => null);
        pushToast(data?.error?.message ?? "Could not start enrolment");
        return;
      }
      const { options } = await challengeRes.json();

      const registration = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/me/passkeys/enroll/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: registration,
          deviceName: deviceName.trim() || null,
        }),
      });
      if (!verifyRes.ok) {
        const data = await verifyRes.json().catch(() => null);
        pushToast(data?.error?.message ?? "Could not save passkey");
        return;
      }
      pushToast("Passkey saved");
      setDeviceName("");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Enrolment failed";
      // Users cancelling the OS prompt show up as a DOMException; quiet it.
      if (msg.toLowerCase().includes("cancel") || msg.toLowerCase().includes("aborted")) {
        // No toast — user dismissed the prompt deliberately.
      } else {
        pushToast(msg);
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/me/passkeys/${id}`, { method: "DELETE" });
    if (!res.ok) {
      pushToast("Could not remove passkey");
      return;
    }
    pushToast("Passkey removed");
    await load();
  };

  if (!supported) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
        <p className="text-sm text-ink-900">Passkeys aren&apos;t supported in this browser.</p>
        <p className="mt-1 text-xs text-ink-500">
          Try a recent Chrome, Safari, Edge, or Firefox build.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
        <label htmlFor="pk-device-name" className="text-sm font-medium text-ink-900">
          Add a passkey
        </label>
        <p className="mt-1 text-xs text-ink-500">
          Sign in with your fingerprint, Face ID, or device PIN instead of a password.
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="pk-device-name"
            type="text"
            placeholder="Device name (e.g. iPhone 15)"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            disabled={enrolling}
            className="flex-1 rounded-xl border border-sand-200 bg-white px-3 py-2.5 text-sm placeholder-ink-400 focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100 disabled:bg-sand-100 disabled:text-ink-500"
          />
          <button
            type="button"
            onClick={handleEnrol}
            disabled={enrolling}
            className="rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-800 disabled:opacity-40"
          >
            {enrolling ? "Enrolling…" : "Add passkey"}
          </button>
        </div>
      </div>
      {passkeys === null ? (
        <p className="text-xs text-ink-500">Loading passkeys…</p>
      ) : passkeys.length === 0 ? (
        <p className="text-xs text-ink-500">No passkeys enrolled yet.</p>
      ) : (
        <ul className="space-y-2">
          {passkeys.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-1 rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {p.deviceName ?? "Passkey"}
                </p>
                <p className="text-xs text-ink-500">
                  Added {formatTimestamp(p.createdAt)} · Last used {formatTimestamp(p.lastUsedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(p.id)}
                className="self-start rounded-xl border border-sand-300 bg-white px-3 py-2 text-xs font-semibold text-ink-600 transition hover:bg-sand-50 sm:self-auto"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
