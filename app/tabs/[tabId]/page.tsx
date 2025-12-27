"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";
import { InviteButton } from "@/app/components/InviteButton";

type TabDetail = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "CLOSED";
  startDate: string;
  endDate: string | null;
  totalSpentCents: number;
  yourNetCents: number;
  isCreator: boolean;
};

type ExpenseSplit = {
  participantId: string;
  participantName: string;
  amountCents: number;
};

type ExpenseSummary = {
  id: string;
  amountTotalCents: number;
  note: string | null;
  paidByParticipantId: string;
  paidByName: string;
  createdAt: string;
  splits: ExpenseSplit[];
};

type Acknowledgement = {
  status: "PENDING" | "ACKNOWLEDGED";
};

export default function TabDashboard() {
  const params = useParams<{ tabId: string }>();
  const tabId = params?.tabId;
  const [tab, setTab] = useState<TabDetail | null>(null);
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [acknowledgements, setAcknowledgements] = useState<Acknowledgement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/expenses`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/acknowledgements`).then((res) => res.json()).catch(() => ({ acknowledgements: [] })),
    ])
      .then(([tabData, expenseData, ackData]) => {
        if (tabData?.tab) {
          setTab(tabData.tab);
        } else {
          setError(tabData?.error?.message ?? "Tab not found.");
        }
        setExpenses(expenseData?.expenses ?? []);
        setAcknowledgements(ackData?.acknowledgements ?? []);
      })
      .catch(() => {
        setError("Tab not found.");
        pushToast("Network error loading tab.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tabId]);

  if (loading) {
    return <p className="text-sm text-ink-500">Loading tab…</p>;
  }

  if (error || !tab) {
    return <p className="text-sm text-ink-500">{error ?? "Tab not found."}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-ink-500">{tab.status}</p>
          <h1 className="text-3xl font-semibold">{tab.name}</h1>
          {tab.description && (
            <p className="text-sm text-ink-500">{tab.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {tab.status === "ACTIVE" && (
            <>
              <a
                href={`/tabs/${tabId}/expenses/new`}
                className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
              >
                Add expense
              </a>
              <InviteButton tabId={tabId!} />
            </>
          )}
          {tab.status === "CLOSED" && (
            <span className="rounded-full border border-ink-300 px-5 py-2 text-sm font-semibold text-ink-500">
              Tab closed
            </span>
          )}
          {tab.isCreator && (
            <a
              href={`/tabs/${tabId}/settings`}
              className="btn-secondary rounded-full px-5 py-2 text-sm font-semibold"
            >
              Settings
            </a>
          )}
        </div>
      </div>

      {/* Settlement banner for closed tabs - shown prominently at top */}
      {tab.status === "CLOSED" && (() => {
        const totalTransfers = acknowledgements.length;
        const confirmedCount = acknowledgements.filter((ack) => ack.status === "ACKNOWLEDGED").length;
        const progressPercent = totalTransfers > 0 ? Math.round((confirmedCount / totalTransfers) * 100) : 100;
        const isComplete = totalTransfers === 0 || confirmedCount === totalTransfers;

        return (
          <div className="rounded-3xl border-2 border-ink-900 bg-white p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                {/* Progress ring */}
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-sand-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={isComplete ? "text-green-500" : "text-ink-900"}
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${progressPercent}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-sm font-semibold">{progressPercent}%</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {isComplete ? "All settled!" : "Time to settle up!"}
                  </h2>
                  <p className="text-sm text-ink-500">
                    {isComplete
                      ? "Everyone's squared away."
                      : `${confirmedCount} of ${totalTransfers} payments confirmed`}
                  </p>
                </div>
              </div>
              <a
                href={`/tabs/${tabId}/settlement`}
                className="btn-primary rounded-full px-6 py-3 text-sm font-semibold text-center"
              >
                {isComplete ? "View details" : "Settle up"}
              </a>
            </div>
          </div>
        );
      })()}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Group total</p>
          <p className="mt-2 text-2xl font-semibold">{formatCents(tab.totalSpentCents)}</p>
          <p className="mt-1 text-sm text-ink-500">All expenses on this tab.</p>
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Your net</p>
          {tab.yourNetCents === 0 ? (
            <>
              <p className="mt-2 text-2xl font-semibold">Even</p>
              <p className="mt-1 text-sm text-ink-500">You're all squared up.</p>
            </>
          ) : tab.yourNetCents > 0 ? (
            <>
              <p className="mt-2 text-2xl font-semibold text-green-600">+{formatCents(tab.yourNetCents)}</p>
              <p className="mt-1 text-sm text-ink-500">Others owe you this amount.</p>
            </>
          ) : (
            <>
              <p className="mt-2 text-2xl font-semibold text-red-600">-{formatCents(Math.abs(tab.yourNetCents))}</p>
              <p className="mt-1 text-sm text-ink-500">You owe others this amount.</p>
            </>
          )}
        </div>
        {tab.status === "ACTIVE" && (
          <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Next step</p>
            <p className="mt-2 text-sm text-ink-500">
              Final amounts calculated when the tab closes.
            </p>
            {tab.isCreator ? (
              <a
                href={`/tabs/${tabId}/close`}
                className="btn-primary mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold"
              >
                Close tab
              </a>
            ) : (
              <p className="mt-3 text-xs text-ink-500">Only the creator can close this tab.</p>
            )}
          </div>
        )}
        {tab.status === "CLOSED" && (
          <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Tab closed</p>
            <p className="mt-2 text-sm text-ink-500">
              Confirm payments to complete.
            </p>
            <a
              href={`/tabs/${tabId}/settlement`}
              className="btn-primary mt-4 inline-block rounded-full px-5 py-2 text-sm font-semibold"
            >
              View settlement
            </a>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent expenses</h2>
            <a href={`/tabs/${tabId}/expenses`} className="text-sm text-ink-500">
              View all
            </a>
          </div>
          <div className="mt-4 grid gap-3">
            {expenses.slice(0, 5).map((expense) => {
              // Get names of people who owe (everyone except the payer)
              const owingPeople = expense.splits
                .filter((split) => split.participantId !== expense.paidByParticipantId && split.amountCents > 0)
                .map((split) => split.participantName);

              // Format the "who owes whom" text
              let owesText = "";
              if (owingPeople.length === 0) {
                owesText = `${expense.paidByName} paid`;
              } else if (owingPeople.length === 1) {
                owesText = `${owingPeople[0]} owes ${expense.paidByName}`;
              } else if (owingPeople.length === 2) {
                owesText = `${owingPeople[0]} and ${owingPeople[1]} owe ${expense.paidByName}`;
              } else {
                owesText = `${owingPeople.slice(0, -1).join(", ")} and ${owingPeople[owingPeople.length - 1]} owe ${expense.paidByName}`;
              }

              return (
                <a
                  key={expense.id}
                  href={`/tabs/${tabId}/expenses/${expense.id}`}
                  className="rounded-2xl border border-sand-200 bg-white/80 px-4 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-ink-700">
                        {expense.note || "Expense"}
                      </span>
                      <p className="truncate text-xs text-ink-500">{owesText}</p>
                    </div>
                    <span className="flex-shrink-0 text-ink-500">{formatCents(expense.amountTotalCents)}</span>
                  </div>
                </a>
              );
            })}
            {expenses.length === 0 && (
              <div className="rounded-2xl border border-dashed border-ink-300 px-4 py-3 text-sm text-ink-500">
                No expenses yet. Add the first one.
              </div>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-sand-200 bg-white/80 p-5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-ink-500">Quick links</h3>
          <div className="mt-4 grid gap-3 text-sm text-ink-500">
            <a href={`/tabs/${tabId}/participants`} className="font-medium text-ink-700">
              Participants
            </a>
            <a href={`/tabs/${tabId}/expenses`} className="font-medium text-ink-700">
              All expenses
            </a>
            <a href={`/tabs/${tabId}/settlement`} className="font-medium text-ink-700">
              Settlement
            </a>
            {tab.isCreator && (
              <a href={`/tabs/${tabId}/settings`} className="font-medium text-ink-700">
                Settings
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
