"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { formatCents } from "@/lib/money/cents";
import { useToast } from "@/app/components/ToastProvider";

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

type Participant = {
  id: string;
  userId: string;
  displayName: string;
  netCents: number;
};

type TabDetail = {
  status: "ACTIVE" | "CLOSED";
};

export default function ExpensesPage() {
  const params = useParams<{ tabId: string }>();
  const tabId = params?.tabId;
  const [expenses, setExpenses] = useState<ExpenseSummary[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [tab, setTab] = useState<TabDetail | null>(null);
  const [payerFilter, setPayerFilter] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  useEffect(() => {
    if (!tabId) return;
    Promise.all([
      fetch(`/api/tabs/${tabId}/expenses`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}/participants`).then((res) => res.json()),
      fetch(`/api/tabs/${tabId}`).then((res) => res.json()),
    ])
      .then(([expenseData, participantData, tabData]) => {
        setExpenses(expenseData.expenses ?? []);
        setParticipants(participantData.participants ?? []);
        setTab(tabData.tab ?? null);
      })
      .catch(() => {
        setError("Couldn't load expenses.");
        pushToast("Network error loading expenses.");
      })
      .finally(() => setLoading(false));
  }, [tabId, pushToast]);

  const filteredExpenses = useMemo(() => {
    if (payerFilter === "all") return expenses;
    return expenses.filter((expense) => expense.paidByParticipantId === payerFilter);
  }, [expenses, payerFilter]);

  if (loading) {
    return <p className="text-sm text-ink-500">Loading expenses…</p>;
  }

  return (
    <div className="space-y-6">
      <a href={`/tabs/${tabId}`} className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to tab
      </a>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Expenses</h1>
          <p className="text-sm text-ink-500">Recent first.</p>
        </div>
        {tab?.status === "ACTIVE" ? (
          <a
            href={`/tabs/${tabId}/expenses/new`}
            className="btn-primary rounded-full px-5 py-2 text-sm font-semibold"
          >
            Add expense
          </a>
        ) : (
          <span className="rounded-full border border-ink-300 px-5 py-2 text-sm font-semibold text-ink-500">
            Tab closed
          </span>
        )}
      </div>

      {error && <p className="text-sm text-ink-500">{error}</p>}

      {participants.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setPayerFilter("all")}
            className={`rounded-full border px-3 py-1 ${
              payerFilter === "all"
                ? "border-ink-900 bg-ink-900 text-sand-50"
                : "border-ink-300 text-ink-700"
            }`}
          >
            All payers
          </button>
          {participants.map((participant) => (
            <button
              key={participant.id}
              type="button"
              onClick={() => setPayerFilter(participant.id)}
              className={`rounded-full border px-3 py-1 ${
                payerFilter === participant.id
                  ? "border-ink-900 bg-ink-900 text-sand-50"
                  : "border-ink-300 text-ink-700"
              }`}
            >
              {participant.displayName}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3">
        {filteredExpenses.map((expense) => {
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
                  <p className="font-medium text-ink-700">{expense.note || "Expense"}</p>
                  <p className="truncate text-xs text-ink-500">{owesText}</p>
                </div>
                <span className="flex-shrink-0 text-ink-500">{formatCents(expense.amountTotalCents)}</span>
              </div>
            </a>
          );
        })}
        {filteredExpenses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-ink-300 px-4 py-3 text-sm text-ink-500">
            No expenses match this filter.
          </div>
        )}
      </div>
    </div>
  );
}
