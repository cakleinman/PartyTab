"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

interface InviteButtonProps {
  tabId: string;
  disabled?: boolean;
}

export function InviteButton({ tabId, disabled }: InviteButtonProps) {
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { pushToast } = useToast();

  const handleCreateAndCopy = async () => {
    setCreating(true);

    const res = await fetch(`/api/tabs/${tabId}/invites`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      pushToast(data?.error?.message ?? "Could not create invite.");
      setCreating(false);
      return;
    }

    const origin = window.location.origin;
    const link = `${origin}/join/${data.invite.token}`;
    setInviteLink(link);

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      pushToast("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      pushToast("Invite created - tap to copy");
    }

    setCreating(false);
  };

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      pushToast("Link copied!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      window.prompt("Copy this invite link:", inviteLink);
    }
  };

  if (inviteLink) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="btn-secondary flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCreateAndCopy}
      disabled={disabled || creating}
      className="btn-secondary flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
      {creating ? "Creating…" : "Invite people"}
    </button>
  );
}
