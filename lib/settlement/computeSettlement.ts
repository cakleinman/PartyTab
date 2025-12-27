export type NetBalance = {
  participantId: string;
  netCents: number;
};

export type SettlementTransfer = {
  fromParticipantId: string;
  toParticipantId: string;
  amountCents: number;
};

export function computeNets(
  participants: { id: string }[],
  expenses: { id: string; paidByParticipantId: string; amountTotalCents: number }[],
  splits: { expenseId: string; participantId: string; amountCents: number }[],
): NetBalance[] {
  const netMap = new Map<string, number>();
  participants.forEach((participant) => {
    netMap.set(participant.id, 0);
  });

  expenses.forEach((expense) => {
    const current = netMap.get(expense.paidByParticipantId) ?? 0;
    netMap.set(expense.paidByParticipantId, current + expense.amountTotalCents);
  });

  splits.forEach((split) => {
    const current = netMap.get(split.participantId) ?? 0;
    netMap.set(split.participantId, current - split.amountCents);
  });

  return [...netMap.entries()].map(([participantId, netCents]) => ({
    participantId,
    netCents,
  }));
}

export function computeSettlement(nets: NetBalance[]): SettlementTransfer[] {
  const creditors = nets
    .filter((net) => net.netCents > 0)
    .sort((a, b) => (b.netCents - a.netCents) || a.participantId.localeCompare(b.participantId));

  const debtors = nets
    .filter((net) => net.netCents < 0)
    .sort((a, b) => (a.netCents - b.netCents) || a.participantId.localeCompare(b.participantId));

  const transfers: SettlementTransfer[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.netCents, creditor.netCents);

    if (amount > 0) {
      transfers.push({
        fromParticipantId: debtor.participantId,
        toParticipantId: creditor.participantId,
        amountCents: amount,
      });
    }

    debtor.netCents += amount;
    creditor.netCents -= amount;

    if (debtor.netCents === 0) i += 1;
    if (creditor.netCents === 0) j += 1;
  }

  const leftover = [...debtors, ...creditors].reduce((sum, net) => sum + net.netCents, 0);
  if (leftover !== 0) {
    throw new Error("Settlement nets do not balance to zero");
  }

  return transfers;
}
