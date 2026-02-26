import { prisma } from "@/lib/db/prisma";
import { formatCents } from "@/lib/money/cents";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ token: string }>;
};

async function getShareData(token: string) {
  const tab = await prisma.tab.findUnique({
    where: { shareToken: token },
    include: {
      participants: {
        include: {
          user: { select: { displayName: true } },
        },
      },
      expenses: {
        select: {
          id: true,
          paidByParticipantId: true,
          amountTotalCents: true,
          isEstimate: true,
        },
      },
      settlement: {
        include: { transfers: true },
      },
      acknowledgements: {
        select: {
          fromParticipantId: true,
          toParticipantId: true,
          status: true,
        },
      },
      invites: {
        where: { revokedAt: null },
        take: 1,
        select: { token: true },
      },
    },
  });

  if (!tab) return null;

  // Build participant name map
  const nameMap = new Map<string, string>();
  for (const p of tab.participants) {
    nameMap.set(p.id, p.user.displayName || "Unknown");
  }

  // Get transfers — saved for closed tabs, computed for active
  let transfers: { fromParticipantId: string; toParticipantId: string; amountCents: number }[];

  if (tab.status === "CLOSED" && tab.settlement) {
    transfers = tab.settlement.transfers;
  } else {
    const splits = await prisma.expenseSplit.findMany({
      where: { expense: { tabId: tab.id } },
      select: { expenseId: true, participantId: true, amountCents: true },
    });
    const nets = computeNets(tab.participants, tab.expenses, splits);
    transfers = computeSettlement(nets.map((n) => ({ ...n })));
  }

  // Map acknowledgement status
  const ackMap = new Map(
    tab.acknowledgements.map((a) => [`${a.fromParticipantId}:${a.toParticipantId}`, a.status]),
  );

  const enrichedTransfers = transfers.map((t) => ({
    fromName: nameMap.get(t.fromParticipantId) || "Unknown",
    toName: nameMap.get(t.toParticipantId) || "Unknown",
    amountCents: t.amountCents,
    status: ackMap.get(`${t.fromParticipantId}:${t.toParticipantId}`) ?? "PENDING",
  }));

  const settled = enrichedTransfers.filter((t) => t.status === "ACKNOWLEDGED");
  const owed = enrichedTransfers.filter((t) => t.status !== "ACKNOWLEDGED");

  const totalCents = tab.expenses.reduce((sum, e) => sum + e.amountTotalCents, 0);
  const hasEstimates = tab.expenses.some((e) => e.isEstimate);
  const inviteToken = tab.invites[0]?.token ?? null;

  return {
    tab: {
      name: tab.name,
      description: tab.description,
      status: tab.status,
    },
    participantCount: tab.participants.length,
    totalCents,
    hasEstimates,
    settled,
    owed,
    transferCount: enrichedTransfers.length,
    inviteToken,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await getShareData(token);
  if (!data) return { title: "Tab not found" };

  const { settled, transferCount } = data;
  const progress =
    transferCount > 0 ? `${settled.length} of ${transferCount} settled up` : "No transfers needed";

  const description = `${data.participantCount} people · ${formatCents(data.totalCents)} total · ${progress}`;

  return {
    title: `${data.tab.name} | PartyTab`,
    description,
    openGraph: {
      title: data.tab.name,
      description,
      type: "website",
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const data = await getShareData(token);
  if (!data) notFound();

  const { tab, participantCount, totalCents, hasEstimates, settled, owed, transferCount, inviteToken } =
    data;
  const isClosed = tab.status === "CLOSED";
  const settledCount = settled.length;

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Tab Header */}
        <div className="rounded-3xl border border-sand-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
            {isClosed ? "Final Settlement" : hasEstimates ? "Settlement Preview" : "Settlement Preview"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink-900">{tab.name}</h1>
          {tab.description && <p className="mt-1 text-sm text-ink-500">{tab.description}</p>}

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">Total</p>
              <p className="mt-1 text-2xl font-semibold">
                {hasEstimates && "~"}
                {formatCents(totalCents)}
              </p>
            </div>
            <div className="rounded-2xl bg-sand-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">People</p>
              <p className="mt-1 text-2xl font-semibold">{participantCount}</p>
            </div>
          </div>

          {hasEstimates && !isClosed && (
            <p className="mt-4 text-xs text-amber-600">
              Amounts may change — some expenses are estimates
            </p>
          )}
        </div>

        {/* Settlement Transfers */}
        {transferCount > 0 && (
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
            {/* Progress */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-ink-900">
                {settledCount} of {transferCount} settled up
              </p>
              <p className="text-xs text-ink-500">
                {Math.round((settledCount / transferCount) * 100)}%
              </p>
            </div>
            <div className="mb-6 h-1.5 w-full rounded-full bg-sand-200">
              <div
                className="h-1.5 rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(settledCount / transferCount) * 100}%` }}
              />
            </div>

            {/* Still Owed */}
            {owed.length > 0 && (
              <>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-500">Still owed</p>
                <div className={`space-y-3 ${settled.length > 0 ? "mb-6" : ""}`}>
                  {owed.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-sand-200 p-4"
                    >
                      <div className="text-sm">
                        <span className="font-semibold text-ink-900">{t.fromName}</span>
                        <span className="text-ink-500"> owes </span>
                        <span className="font-semibold text-ink-900">{t.toName}</span>
                      </div>
                      <span className="text-lg font-semibold text-ink-900">
                        {formatCents(t.amountCents)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Settled Up */}
            {settled.length > 0 && (
              <>
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-ink-500">Settled up</p>
                <div className="space-y-3">
                  {settled.map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        <svg
                          className="h-4 w-4 text-emerald-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <div>
                          <span className="text-ink-600">{t.fromName}</span>
                          <span className="text-ink-400"> paid </span>
                          <span className="text-ink-600">{t.toName}</span>
                        </div>
                      </div>
                      <span className="text-ink-500">{formatCents(t.amountCents)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* No transfers */}
        {transferCount === 0 && (
          <div className="rounded-3xl border border-sand-200 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-ink-500">No one owes anything — you&apos;re all even!</p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2 text-center">
          {inviteToken && (
            <Link
              href={`/join/${inviteToken}`}
              className="btn-primary inline-block rounded-full px-8 py-3 text-sm font-semibold"
            >
              Join this tab
            </Link>
          )}
          <Link
            href="/tabs/new"
            className={`block text-sm font-medium ${inviteToken ? "text-ink-600 hover:underline" : "btn-primary inline-block rounded-full px-8 py-3 font-semibold"}`}
          >
            Create your own tab
          </Link>
          <p className="pt-2 text-xs text-ink-400">
            Powered by{" "}
            <Link href="/" className="font-medium text-ink-600 hover:underline">
              PartyTab
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
