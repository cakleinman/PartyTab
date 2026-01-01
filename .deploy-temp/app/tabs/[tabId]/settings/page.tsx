"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

type TabDetail = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED";
  startDate: string;
  endDate: string | null;
  isCreator: boolean;
};

type Invite = {
  token: string;
  createdAt: string;
} | null;

export default function SettingsPage() {
  const params = useParams<{ tabId: string }>();
  const router = useRouter();
  const tabId = params?.tabId;
  const [tab, setTab] = useState<TabDetail | null>(null);
  const [invite, setInvite] = useState<Invite>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/invites`).then((res) => res.json()),
    ])
      .then(([tabData, inviteData]) => {
        if (tabData?.tab) {
          setTab(tabData.tab);
          setName(tabData.tab.name);
          setDescription(tabData.tab.description ?? "");
          setEndDate(tabData.tab.endDate ?? "");
        } else {
          setError(tabData?.error?.message ?? "Could not load tab settings.");
        }
        setInvite(inviteData?.invite ?? null);
      })
      .catch(() => setError("Could not load tab settings."));
  }, [tabId]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!tabId) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/tabs/${tabId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, endDate: endDate || null }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not update tab.");
      setSaving(false);
      return;
    }

    setTab(data.tab);
    setSaving(false);
  };

  const handleCreateInvite = async () => {
    if (!tabId) return;
    setCreatingInvite(true);
    setError(null);

    const res = await fetch(`/api/tabs/${tabId}/invites`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data?.error?.message ?? "Could not create invite.");
      setCreatingInvite(false);
      return;
    }

    setInvite(data.invite);
    setCreatingInvite(false);
  };

  const handleCopy = async () => {
    if (!invite) return;
    const origin = window.location.origin;
    const link = `${origin}/join/${invite.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedToken(invite.token);
      setTimeout(() => setCopiedToken(null), 2000);
      pushToast("Invite link copied.");
    } catch {
      window.prompt("Copy invite link:", link);
    }
  };

  if (!tab) {
    return (
      <p className="text-sm text-ink-500">
        {error ?? "Loading settings…"}
      </p>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="max-w-3xl space-y-8">
      <a href={`/tabs/${tabId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tab
      </a>
      <div>
        <h1 className="text-3xl font-semibold">Tab settings</h1>
        <p className="text-sm text-ink-500">Only the creator can edit settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-3xl border border-sand-200 bg-white/80 p-6">
        <label className="grid gap-2 text-sm">
          Tab name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!tab.isCreator || tab.status === "CLOSED"}
          />
        </label>
        <label className="grid gap-2 text-sm">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[90px] rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!tab.isCreator || tab.status === "CLOSED"}
          />
        </label>
        <label className="grid gap-2 text-sm">
          End date
          <input
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-2xl border border-sand-200 px-4 py-2"
            disabled={!tab.isCreator || tab.status === "CLOSED"}
          />
        </label>

        {error && <p className="text-sm text-ink-500">{error}</p>}

        {tab.isCreator && tab.status === "ACTIVE" ? (
          <button
            type="submit"
            disabled={saving}
            className="btn-primary rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        ) : (
          <p className="text-xs text-ink-500">
            {tab.status === "CLOSED"
              ? "This tab is closed and read-only."
              : "Only the creator can edit settings."}
          </p>
        )}
      </form>

      <section className="space-y-4 rounded-3xl border border-sand-200 bg-white/80 p-6">
        <div>
          <h2 className="text-lg font-semibold">Invite link</h2>
          <p className="text-sm text-ink-500">Share this link to invite others to the tab.</p>
        </div>

        {invite ? (
          <div className="rounded-2xl border border-sand-200 bg-sand-50 px-4 py-3">
            <p className="break-all text-ink-700">{`${origin}/join/${invite.token}`}</p>
            {tab.isCreator && tab.status === "ACTIVE" && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-3 rounded-full border border-ink-300 px-4 py-1 text-xs font-semibold text-ink-700"
              >
                {copiedToken === invite.token ? "Copied!" : "Copy link"}
              </button>
            )}
          </div>
        ) : tab.isCreator && tab.status === "ACTIVE" ? (
          <button
            onClick={handleCreateInvite}
            disabled={creatingInvite}
            className="btn-secondary rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {creatingInvite ? "Creating…" : "Generate invite link"}
          </button>
        ) : (
          <p className="text-sm text-ink-500">
            {tab.status === "CLOSED" ? "This tab is closed." : "Only the creator can create invites."}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-sand-200 bg-white/80 p-6">
        <h2 className="text-lg font-semibold">Close tab</h2>
        <p className="text-sm text-ink-500">
          Closing is permanent and will calculate final settlement transfers.
        </p>
        {tab.isCreator && tab.status === "ACTIVE" ? (
          <button
            onClick={() => router.push(`/tabs/${tabId}/close`)}
            className="btn-secondary mt-4 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Review & close
          </button>
        ) : (
          <p className="mt-4 text-xs text-ink-500">
            {tab.status === "CLOSED"
              ? "This tab is already closed."
              : "Only the creator can close the tab."}
          </p>
        )}
      </section>
    </div>
  );
}
