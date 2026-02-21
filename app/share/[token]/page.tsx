import { prisma } from "@/lib/db/prisma";
import { formatCents } from "@/lib/money/cents";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ token: string }>;
};

async function getTabByShareToken(token: string) {
  const tab = await prisma.tab.findUnique({
    where: { shareToken: token },
    include: {
      participants: { select: { id: true } },
      expenses: { select: { amountTotalCents: true, isEstimate: true } },
      settlement: {
        include: {
          transfers: { select: { id: true } },
        },
      },
    },
  });
  return tab;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const tab = await getTabByShareToken(token);
  if (!tab) return { title: "Tab not found" };

  const participantCount = tab.participants.length;
  const totalCents = tab.expenses.reduce((sum, e) => sum + e.amountTotalCents, 0);
  const perPerson = participantCount > 0 ? Math.round(totalCents / participantCount) : 0;
  const hasEstimates = tab.expenses.some((e) => e.isEstimate);

  const description = hasEstimates
    ? `~${formatCents(perPerson)}/person · ${participantCount} people`
    : `${formatCents(perPerson)}/person · ${participantCount} people · ${formatCents(totalCents)} total`;

  return {
    title: `${tab.name} | PartyTab`,
    description,
    openGraph: {
      title: tab.name,
      description,
      type: "website",
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const tab = await getTabByShareToken(token);
  if (!tab) notFound();

  const participantCount = tab.participants.length;
  const totalCents = tab.expenses.reduce((sum, e) => sum + e.amountTotalCents, 0);
  const estimatedCents = tab.expenses
    .filter((e) => e.isEstimate)
    .reduce((sum, e) => sum + e.amountTotalCents, 0);
  const confirmedCents = totalCents - estimatedCents;
  const perPerson = participantCount > 0 ? Math.round(totalCents / participantCount) : 0;
  const hasEstimates = estimatedCents > 0;
  const isClosed = tab.status === "CLOSED";
  const transferCount = tab.settlement?.transfers.length ?? 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Summary card */}
        <div className="rounded-3xl border border-sand-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            {isClosed ? "Final Summary" : hasEstimates ? "Budget Estimate" : "Group Tab"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900">{tab.name}</h1>
          {tab.description && (
            <p className="mt-1 text-sm text-ink-500">{tab.description}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                {hasEstimates ? "~Per person" : "Per person"}
              </p>
              <p className="mt-1 text-2xl font-semibold">
                {hasEstimates && "~"}
                {formatCents(perPerson)}
              </p>
            </div>
            <div className="rounded-2xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">People</p>
              <p className="mt-1 text-2xl font-semibold">{participantCount}</p>
            </div>
          </div>

          {isClosed && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-sand-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Total</p>
                <p className="mt-1 text-xl font-semibold">{formatCents(totalCents)}</p>
              </div>
              <div className="rounded-2xl bg-sand-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Transfers</p>
                <p className="mt-1 text-xl font-semibold">{transferCount}</p>
              </div>
            </div>
          )}

          {hasEstimates && !isClosed && (
            <p className="mt-4 text-xs text-amber-600">
              {formatCents(estimatedCents)} estimated · {formatCents(confirmedCents)} confirmed
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="space-y-3 text-center">
          <Link
            href="/tabs/new"
            className="btn-primary inline-block rounded-full px-8 py-3 text-sm font-semibold"
          >
            Create your own tab
          </Link>
          <p className="text-xs text-ink-400">
            Split expenses with friends — no signup required
          </p>
        </div>

        {/* Branding */}
        <p className="text-center text-xs text-ink-400">
          Powered by{" "}
          <Link href="/" className="font-medium text-ink-600 hover:underline">
            PartyTab
          </Link>
        </p>
      </div>
    </div>
  );
}
