"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { PaymentMethodForm, type PaymentMethod } from "@/app/components/PaymentMethodForm";
import { useToast } from "@/app/components/ToastProvider";

type User = {
  id: string;
  displayName: string;
  email: string | null;
  authProvider: "GUEST" | "EMAIL" | "GOOGLE";
  subscriptionTier: "GUEST" | "BASIC" | "PRO";
  paymentMethods: PaymentMethod[];
  reminderEmailsEnabled: boolean;
};

export default function SettingsClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [displayNameSaving, setDisplayNameSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [reminderEmailsEnabled, setReminderEmailsEnabled] = useState(true);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { pushToast } = useToast();

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        setDisplayName(data.user.displayName);
        setEmail(data.user.email || "");
        setReminderEmailsEnabled(data.user.reminderEmailsEnabled ?? true);
      }
    } catch {
      pushToast("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisplayNameSave = async () => {
    if (!displayName.trim()) return;
    setDisplayNameSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      if (!res.ok) {
        const data = await res.json();
        pushToast(data?.error?.message ?? "Failed to update display name");
        return;
      }
      setUser((prev) => (prev ? { ...prev, displayName } : null));
      pushToast("Display name updated");
    } catch {
      pushToast("Failed to update display name");
    } finally {
      setDisplayNameSaving(false);
    }
  };

  const handleEmailSave = async () => {
    if (!email.trim()) return;
    setEmailSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        pushToast(data?.error?.message ?? "Failed to update email");
        return;
      }
      setUser((prev) => (prev ? { ...prev, email } : null));
      pushToast("Email updated");
    } catch {
      pushToast("Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordError("Both password fields are required");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setPasswordError(data?.error?.message ?? "Failed to update password");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      pushToast("Password updated");
    } catch {
      setPasswordError("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleReminderToggle = async () => {
    const newValue = !reminderEmailsEnabled;
    setReminderSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderEmailsEnabled: newValue }),
      });
      if (!res.ok) {
        pushToast("Failed to update reminders");
        return;
      }
      setReminderEmailsEnabled(newValue);
      pushToast(newValue ? "Email reminders enabled" : "Email reminders disabled");
    } catch {
      pushToast("Failed to update reminders");
    } finally {
      setReminderSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/me/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: "DELETE" }),
      });
      if (!res.ok) {
        pushToast("Failed to delete account");
        setDeleteLoading(false);
        return;
      }
      if (user?.authProvider !== "GUEST") {
        await signOut({ redirect: false });
      }
      await fetch("/api/logout", { method: "POST" });
      window.location.href = "/";
    } catch {
      pushToast("Failed to delete account");
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner className="h-6 w-6 text-ink-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-sm text-ink-500">
        Could not load settings. <Link href="/login" className="underline">Sign in</Link> to continue.
      </p>
    );
  }

  const isGuest = user.authProvider === "GUEST";
  const isEmailAuth = user.authProvider === "EMAIL";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/tabs"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to tabs
        </Link>
        <h1 className="mt-2 text-3xl font-semibold">Settings</h1>
      </div>

      {/* Guest upgrade banner */}
      {isGuest && (
        <div className="rounded-2xl sm:rounded-3xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
          <p className="text-sm text-amber-900 mb-3">
            You&apos;re using a guest account. Create an account to save payment methods and access all
            settings.
          </p>
          <Link
            href="/register"
            className="btn-primary inline-block rounded-full px-5 py-2 text-sm font-semibold"
          >
            Create account
          </Link>
        </div>
      )}

      {/* Profile */}
      <section className="rounded-2xl sm:rounded-3xl border border-sand-200 bg-white/80 p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-ink-700 mb-1">
            Display name
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full sm:flex-1 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100"
            />
            <button
              type="button"
              onClick={handleDisplayNameSave}
              disabled={displayNameSaving || displayName === user.displayName}
              className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50 w-full sm:w-auto"
            >
              {displayNameSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-500">
          Signed in via
          <span className="rounded-full bg-sand-100 px-2.5 py-0.5 text-xs font-semibold text-ink-700">
            {user.authProvider === "GUEST" ? "Guest PIN" : user.authProvider === "EMAIL" ? "Email" : "Google"}
          </span>
        </div>
      </section>

      {/* Email */}
      {!isGuest && (
        <section className="rounded-2xl sm:rounded-3xl border border-sand-200 bg-white/80 p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Email</h2>
          {isEmailAuth ? (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
                Email address
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full sm:flex-1 rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100"
                />
                <button
                  type="button"
                  onClick={handleEmailSave}
                  disabled={emailSaving || email === (user.email ?? "")}
                  className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50 w-full sm:w-auto"
                >
                  {emailSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-ink-700">{user.email}</p>
              <p className="text-xs text-ink-400 mt-1">Managed by Google</p>
            </div>
          )}
        </section>
      )}

      {/* Password */}
      {isEmailAuth && (
        <section className="rounded-2xl sm:rounded-3xl border border-sand-200 bg-white/80 p-4 sm:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Password</h2>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-ink-700 mb-1">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700 mb-1">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100"
            />
          </div>
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          <button
            type="button"
            onClick={handlePasswordChange}
            disabled={passwordSaving || !currentPassword || !newPassword}
            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {passwordSaving ? "Updating…" : "Update password"}
          </button>
        </section>
      )}

      {/* Payment Methods */}
      <section className="rounded-2xl sm:rounded-3xl border border-sand-200 bg-white/80 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Payment methods</h2>
          <p className="text-xs text-ink-500">
            Add your Venmo, Zelle, or other handles so people know how to pay you.
          </p>
        </div>
        <PaymentMethodForm
          paymentMethods={user.paymentMethods}
          onUpdate={fetchUser}
          disabled={isGuest}
        />
      </section>

      {/* Notifications */}
      {!isGuest && (
        <section className="rounded-2xl sm:rounded-3xl border border-sand-200 bg-white/80 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Email reminders</h2>
              <p className="text-xs text-ink-500">Receive email reminders about unpaid debts</p>
            </div>
            <button
              type="button"
              onClick={handleReminderToggle}
              disabled={reminderSaving}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
                reminderEmailsEnabled ? "bg-green-600" : "bg-sand-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  reminderEmailsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </section>
      )}

      {/* Danger Zone */}
      <section className="rounded-2xl sm:rounded-3xl border-2 border-red-200 bg-red-50/50 p-4 sm:p-6 space-y-4">
        <h2 className="text-lg font-semibold text-red-900">Danger zone</h2>
        <p className="text-sm text-red-800">
          Permanently delete your account. Your display name on existing tabs will be anonymized.
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Delete account
        </button>

        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 sm:p-6">
            <div className="w-full max-w-sm space-y-4 rounded-2xl sm:rounded-3xl bg-white p-5 sm:p-6">
              <h3 className="text-lg font-semibold">Delete account</h3>
              <p className="text-sm text-ink-600">
                This cannot be undone. Your data will be permanently deleted.
              </p>
              <p className="text-sm text-ink-600">
                Type <strong>DELETE</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm focus:border-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-100"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setDeleteConfirmation("");
                  }}
                  className="rounded-full border border-sand-200 px-5 py-2 text-sm font-semibold transition hover:bg-sand-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmation !== "DELETE"}
                  className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting…" : "Delete account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
