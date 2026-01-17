"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";

type Participant = {
  id: string;
  userId: string;
  displayName: string;
  netCents: number;
};

type Transfer = {
  fromParticipantId: string;
  toParticipantId: string;
  amountCents: number;
};

type Acknowledgement = {
  fromParticipantId: string;
  toParticipantId: string;
  amountCents: number;
  status: "PENDING" | "ACKNOWLEDGED";
  initiatedAt: string | null;
  acknowledgedAt: string | null;
};

type Settlement = {
  createdAt: string;
  transfers: Transfer[];
};

type TabInfo = {
  status: "ACTIVE" | "CLOSED";
  isCreator: boolean;
};

export default function SettlementPage() {
  const params = useParams<{ tabId: string }>();
  const tabId = params?.tabId;
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [settlement, setSettlement] = useState<Settlement | null>(null);
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgement[]>([]);
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reminderError, setReminderError] = useState<string | null>(null);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/settlement`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/acknowledgements`).then((res) => res.json()),
      fetch(`/api/me`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
    ])
      .then(([participantData, settlementData, acknowledgementData, meData, tabData]) => {
        setParticipants(participantData.participants ?? []);
        setUserId(meData?.user?.id ?? null);
        setIsPro(meData?.user?.subscriptionTier === "PRO");
        setTabInfo(tabData?.tab ? { status: tabData.tab.status, isCreator: tabData.tab.isCreator } : null);
        setIsPreview(settlementData?.isPreview ?? false);
        if (settlementData?.settlement) {
          setSettlement(settlementData.settlement);
        } else {
          setError(settlementData?.error?.message ?? "Settlement not available yet.");
        }
        setAcknowledgements(acknowledgementData?.acknowledgements ?? []);
      })
      .catch(() => setError("Settlement not available yet."))
      .finally(() => setLoading(false));
  }, [tabId]);

  const nameById = useMemo(() => {
    const map = new Map<string, string>();
    participants.forEach((participant) => map.set(participant.id, participant.displayName));
    return map;
  }, [participants]);

  const currentParticipantId = participants.find((p) => p.userId === userId)?.id;

  const acknowledgementMap = useMemo(() => {
    const map = new Map<string, Acknowledgement>();
    acknowledgements.forEach((ack) => {
      map.set(`${ack.fromParticipantId}:${ack.toParticipantId}`, ack);
    });
    return map;
  }, [acknowledgements]);

  // Categorize transfers
  const categorizedTransfers = useMemo(() => {
    if (!settlement) return { yourActions: [], waitingOnOthers: [], completed: [] };

    const yourActions: Transfer[] = [];
    const waitingOnOthers: Transfer[] = [];
    const completed: Transfer[] = [];

    settlement.transfers.forEach((transfer) => {
      const ack = acknowledgementMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
      const isPayer = currentParticipantId === transfer.fromParticipantId;
      const isReceiver = currentParticipantId === transfer.toParticipantId;

      if (ack?.status === "ACKNOWLEDGED") {
        completed.push(transfer);
      } else if (ack?.initiatedAt) {
        // Payer has marked paid, waiting for receiver to confirm
        if (isReceiver) {
          yourActions.push(transfer);
        } else {
          waitingOnOthers.push(transfer);
        }
      } else {
        // Waiting for payer to mark paid
        if (isPayer) {
          yourActions.push(transfer);
        } else {
          waitingOnOthers.push(transfer);
        }
      }
    });

    return { yourActions, waitingOnOthers, completed };
  }, [settlement, acknowledgementMap, currentParticipantId]);

  const handleMarkPaid = async (transfer: Transfer) => {
    if (!tabId) return;
    setActionLoading(`pay-${transfer.fromParticipantId}-${transfer.toParticipantId}`);
    const res = await fetch(`/api/tabs/${tabId}/acknowledgements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromParticipantId: transfer.fromParticipantId,
        toParticipantId: transfer.toParticipantId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      pushToast(data?.error?.message ?? "Could not mark as paid.");
      setActionLoading(null);
      return;
    }
    setAcknowledgements((prev) => {
      const filtered = prev.filter(
        (ack) =>
          !(ack.fromParticipantId === transfer.fromParticipantId &&
            ack.toParticipantId === transfer.toParticipantId),
      );
      return [...filtered, data.acknowledgement];
    });
    pushToast("Marked as paid.");
    setActionLoading(null);
  };

  const handleConfirm = async (transfer: Transfer) => {
    if (!tabId) return;
    setActionLoading(`confirm-${transfer.fromParticipantId}-${transfer.toParticipantId}`);
    const res = await fetch(`/api/tabs/${tabId}/acknowledgements/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromParticipantId: transfer.fromParticipantId,
        toParticipantId: transfer.toParticipantId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      pushToast(data?.error?.message ?? "Could not confirm.");
      setActionLoading(null);
      return;
    }
    setAcknowledgements((prev) => {
      const filtered = prev.filter(
        (ack) =>
          !(ack.fromParticipantId === transfer.fromParticipantId &&
            ack.toParticipantId === transfer.toParticipantId),
      );
      return [...filtered, data.acknowledgement];
    });
    pushToast("Confirmed received.");
    setActionLoading(null);
  };

  const handleSendReminder = async (transfer: Transfer) => {
    if (!tabId) return;
    setReminderError(null);
    setActionLoading(`reminder-${transfer.fromParticipantId}-${transfer.toParticipantId}`);
    const res = await fetch(`/api/tabs/${tabId}/reminders/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        debtorParticipantId: transfer.fromParticipantId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      const errorMessage = data?.error?.message ?? "Could not send reminder.";
      setReminderError(errorMessage);
      pushToast(errorMessage);
      setActionLoading(null);
      return;
    }
    pushToast("Reminder sent!");
    setActionLoading(null);
  };

  const getTransferStatus = (transfer: Transfer) => {
    const ack = acknowledgementMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
    if (ack?.status === "ACKNOWLEDGED") {
      return { label: "Complete", color: "text-green-600", bg: "bg-green-50 border-green-200" };
    }
    if (ack?.initiatedAt) {
      return { label: "Awaiting confirmation", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    }
    return { label: "Awaiting payment", color: "text-ink-500", bg: "bg-sand-50 border-sand-200" };
  };

  if (loading) {
    return <p className="text-sm text-ink-500">Loading settlement…</p>;
  }

  if (error || !settlement) {
    return <p className="text-sm text-ink-500">{error ?? "Settlement not available."}</p>;
  }

  const confirmedCount = acknowledgements.filter((ack) => ack.status === "ACKNOWLEDGED").length;
  const totalTransfers = settlement.transfers.length;

  return (
    <div className="max-w-2xl space-y-6">
      <a href={`/tabs/${tabId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tab
      </a>

      <div>
        <h1 className="text-3xl font-semibold">
          {isPreview ? "Settlement preview" : "Final settlement"}
        </h1>
        <p className="text-sm text-ink-500">
          {isPreview
            ? "See where things stand. You can settle debts early while the tab is still open."
            : "Pay using Venmo, Zelle, or cash. Mark it paid, then the recipient confirms."}
        </p>
      </div>

      {totalTransfers === 0 ? (
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-6 text-sm text-ink-500">
          No one owes anything. You&apos;re all even!
        </div>
      ) : (
        <>
          {/* Progress summary */}
          <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Progress</p>
                <p className="mt-1 text-2xl font-semibold">
                  {confirmedCount} of {totalTransfers} complete
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-100">
                <span className="text-lg font-semibold">
                  {totalTransfers > 0 ? Math.round((confirmedCount / totalTransfers) * 100) : 0}%
                </span>
              </div>
            </div>
            {confirmedCount === totalTransfers && (
              <p className="mt-3 text-sm text-green-600 font-medium">
                All settled up!
              </p>
            )}
          </div>

          {/* Your actions needed */}
          {categorizedTransfers.yourActions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-ink-900">Your action needed</h2>
              <div className="grid gap-3">
                {categorizedTransfers.yourActions.map((transfer) => {
                  const ack = acknowledgementMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
                  const actionKey = `${transfer.fromParticipantId}-${transfer.toParticipantId}`;
                  const isPayer = currentParticipantId === transfer.fromParticipantId;
                  const isReceiver = currentParticipantId === transfer.toParticipantId;

                  return (
                    <div
                      key={actionKey}
                      className="rounded-2xl border-2 border-ink-900 bg-white px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          {isPayer ? (
                            <p className="text-sm text-ink-700">
                              You owe <span className="font-semibold">{nameById.get(transfer.toParticipantId)}</span>
                            </p>
                          ) : (
                            <p className="text-sm text-ink-700">
                              <span className="font-semibold">{nameById.get(transfer.fromParticipantId)}</span> paid you
                            </p>
                          )}
                          <p className="text-2xl font-semibold">{formatCents(transfer.amountCents)}</p>
                        </div>
                        {isPayer && !ack?.initiatedAt && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(transfer)}
                            disabled={actionLoading === `pay-${actionKey}`}
                            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
                          >
                            {actionLoading === `pay-${actionKey}` ? "Marking…" : "I've paid"}
                          </button>
                        )}
                        {isReceiver && ack?.initiatedAt && (
                          <button
                            type="button"
                            onClick={() => handleConfirm(transfer)}
                            disabled={actionLoading === `confirm-${actionKey}`}
                            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold disabled:opacity-50"
                          >
                            {actionLoading === `confirm-${actionKey}` ? "Confirming…" : "Confirm received"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Waiting on others */}
          {categorizedTransfers.waitingOnOthers.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-ink-500">Waiting on others</h2>
              <div className="grid gap-3">
                {categorizedTransfers.waitingOnOthers.map((transfer) => {
                  const ack = acknowledgementMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
                  const actionKey = `${transfer.fromParticipantId}-${transfer.toParticipantId}`;
                  const isCurrentUserCreditor = currentParticipantId === transfer.toParticipantId;
                  const canSendReminder = isPro && isCurrentUserCreditor && ack?.status !== "ACKNOWLEDGED";

                  return (
                    <div
                      key={actionKey}
                      className="rounded-2xl border border-sand-200 bg-white/80 px-4 py-3"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm">
                            <span className="font-medium text-ink-700">
                              {nameById.get(transfer.fromParticipantId)}
                            </span>
                            {" → "}
                            <span className="font-medium text-ink-700">
                              {nameById.get(transfer.toParticipantId)}
                            </span>
                            <span className="ml-2">{formatCents(transfer.amountCents)}</span>
                          </div>
                          <span className="text-xs text-amber-600">
                            {ack?.initiatedAt ? "Awaiting confirmation" : "Awaiting payment"}
                          </span>
                        </div>
                        {canSendReminder && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSendReminder(transfer)}
                              disabled={actionLoading === `reminder-${actionKey}`}
                              className="text-xs text-green-600 hover:text-green-700 disabled:opacity-50 font-medium"
                            >
                              {actionLoading === `reminder-${actionKey}` ? "Sending…" : "Send reminder"}
                            </button>
                            {reminderError && (
                              <span className="text-xs text-red-600">{reminderError}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Completed */}
          {categorizedTransfers.completed.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-green-600">Completed</h2>
              <div className="grid gap-3">
                {categorizedTransfers.completed.map((transfer) => {
                  const actionKey = `${transfer.fromParticipantId}-${transfer.toParticipantId}`;

                  return (
                    <div
                      key={actionKey}
                      className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm">
                          <span className="font-medium text-ink-700">
                            {nameById.get(transfer.fromParticipantId)}
                          </span>
                          {" → "}
                          <span className="font-medium text-ink-700">
                            {nameById.get(transfer.toParticipantId)}
                          </span>
                          <span className="ml-2">{formatCents(transfer.amountCents)}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Tab owner dashboard */}
          {tabInfo?.isCreator && (
            <section className="space-y-3 border-t border-sand-200 pt-6">
              <div>
                <h2 className="text-lg font-semibold">Owner dashboard</h2>
                <p className="text-xs text-ink-500">Full visibility into all transfers</p>
              </div>
              <div className="grid gap-2">
                {settlement.transfers.map((transfer) => {
                  const ack = acknowledgementMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
                  const status = getTransferStatus(transfer);
                  const actionKey = `${transfer.fromParticipantId}-${transfer.toParticipantId}`;

                  return (
                    <div
                      key={actionKey}
                      className={`rounded-xl border px-4 py-3 text-sm ${status.bg}`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-medium">{nameById.get(transfer.fromParticipantId)}</span>
                          {" → "}
                          <span className="font-medium">{nameById.get(transfer.toParticipantId)}</span>
                          <span className="ml-2 text-ink-500">{formatCents(transfer.amountCents)}</span>
                        </div>
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {ack && (
                        <div className="mt-1 text-xs text-ink-500">
                          {ack.initiatedAt && (
                            <span>Paid marked {new Date(ack.initiatedAt).toLocaleDateString()}</span>
                          )}
                          {ack.acknowledgedAt && (
                            <span> · Confirmed {new Date(ack.acknowledgedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}

      <p className="text-xs text-ink-500">
        This doesn&apos;t move money. It&apos;s a confirmation system so everyone knows who&apos;s paid.
        {isPreview && " Amounts shown may change as new expenses are added."}
      </p>
    </div>
  );
}
