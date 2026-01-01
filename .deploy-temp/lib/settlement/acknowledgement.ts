import type { PrismaClient } from "@prisma/client";
import { throwApiError } from "@/lib/api/errors";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";

// Helper to compute transfers for active tabs
async function computeTransfersForActiveTab(prisma: PrismaClient, tabId: string) {
  const [participants, expenses, splits] = await Promise.all([
    prisma.participant.findMany({ where: { tabId }, select: { id: true } }),
    prisma.expense.findMany({ where: { tabId }, select: { id: true, paidByParticipantId: true, amountTotalCents: true } }),
    prisma.expenseSplit.findMany({ where: { expense: { tabId } }, select: { expenseId: true, participantId: true, amountCents: true } }),
  ]);

  const nets = computeNets(participants, expenses, splits);
  return computeSettlement(nets.map((net) => ({ ...net })));
}

export async function listAcknowledgements(
  prisma: PrismaClient,
  tabId: string,
  userId: string,
) {
  const tab = await prisma.tab.findUnique({ where: { id: tabId } });
  if (!tab) {
    throwApiError(404, "not_found", "Tab not found");
  }

  const participant = await prisma.participant.findUnique({
    where: { tabId_userId: { tabId, userId } },
  });
  if (!participant) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }

  // Get transfers - from Settlement for closed tabs, computed for active tabs
  let transfers: { fromParticipantId: string; toParticipantId: string; amountCents: number }[];

  if (tab.status === "CLOSED") {
    const settlement = await prisma.settlement.findUnique({
      where: { tabId },
      include: { transfers: true },
    });

    if (!settlement) {
      throwApiError(404, "not_found", "Settlement not found");
    }

    transfers = settlement.transfers;
  } else {
    // Compute transfers on-the-fly for active tabs
    transfers = await computeTransfersForActiveTab(prisma, tabId);
  }

  const acknowledgements = await prisma.settlementAcknowledgement.findMany({
    where: { tabId },
  });

  const ackMap = new Map(
    acknowledgements.map((ack) => [
      `${ack.fromParticipantId}:${ack.toParticipantId}`,
      ack,
    ]),
  );

  return transfers.map((transfer) => {
    const ack = ackMap.get(`${transfer.fromParticipantId}:${transfer.toParticipantId}`);
    return {
      fromParticipantId: transfer.fromParticipantId,
      toParticipantId: transfer.toParticipantId,
      amountCents: transfer.amountCents,
      status: ack?.status ?? "PENDING",
      initiatedAt: ack?.initiatedAt?.toISOString() ?? null,
      acknowledgedAt: ack?.acknowledgedAt?.toISOString() ?? null,
    };
  });
}

export async function initiateAcknowledgement(
  prisma: PrismaClient,
  params: {
    tabId: string;
    userId: string;
    fromParticipantId: string;
    toParticipantId: string;
  },
) {
  const tab = await prisma.tab.findUnique({ where: { id: params.tabId } });
  if (!tab) {
    throwApiError(404, "not_found", "Tab not found");
  }

  const fromParticipant = await prisma.participant.findUnique({
    where: { id: params.fromParticipantId },
  });
  if (!fromParticipant || fromParticipant.tabId !== params.tabId) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }
  if (fromParticipant.userId !== params.userId) {
    throwApiError(403, "forbidden", "Only the payer can initiate acknowledgement");
  }

  const toParticipant = await prisma.participant.findUnique({
    where: { id: params.toParticipantId },
  });
  if (!toParticipant || toParticipant.tabId !== params.tabId) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }

  // Get transfer amount - from Settlement for closed tabs, computed for active tabs
  let transferAmount: number;

  if (tab.status === "CLOSED") {
    const transfer = await prisma.settlementTransfer.findFirst({
      where: {
        fromParticipantId: params.fromParticipantId,
        toParticipantId: params.toParticipantId,
        settlement: { tabId: params.tabId },
      },
    });

    if (!transfer) {
      throwApiError(404, "not_found", "Settlement transfer not found");
    }

    transferAmount = transfer.amountCents;
  } else {
    // Compute transfers on-the-fly for active tabs
    const transfers = await computeTransfersForActiveTab(prisma, params.tabId);
    const transfer = transfers.find(
      (t) =>
        t.fromParticipantId === params.fromParticipantId &&
        t.toParticipantId === params.toParticipantId
    );

    if (!transfer) {
      throwApiError(404, "not_found", "No transfer needed between these participants");
    }

    transferAmount = transfer.amountCents;
  }

  const existing = await prisma.settlementAcknowledgement.findUnique({
    where: {
      tabId_fromParticipantId_toParticipantId: {
        tabId: params.tabId,
        fromParticipantId: params.fromParticipantId,
        toParticipantId: params.toParticipantId,
      },
    },
  });

  if (existing?.status === "ACKNOWLEDGED") {
    throwApiError(409, "forbidden", "Already acknowledged");
  }

  return prisma.settlementAcknowledgement.upsert({
    where: {
      tabId_fromParticipantId_toParticipantId: {
        tabId: params.tabId,
        fromParticipantId: params.fromParticipantId,
        toParticipantId: params.toParticipantId,
      },
    },
    update: {
      status: "PENDING",
      amountCents: transferAmount,
      initiatedByUserId: params.userId,
      initiatedAt: new Date(),
      acknowledgedByUserId: null,
      acknowledgedAt: null,
    },
    create: {
      tabId: params.tabId,
      fromParticipantId: params.fromParticipantId,
      toParticipantId: params.toParticipantId,
      amountCents: transferAmount,
      status: "PENDING",
      initiatedByUserId: params.userId,
      initiatedAt: new Date(),
    },
  });
}

export async function confirmAcknowledgement(
  prisma: PrismaClient,
  params: {
    tabId: string;
    userId: string;
    fromParticipantId: string;
    toParticipantId: string;
  },
) {
  const tab = await prisma.tab.findUnique({ where: { id: params.tabId } });
  if (!tab) {
    throwApiError(404, "not_found", "Tab not found");
  }
  // Removed tab.status check - allow confirmations on active tabs too

  const toParticipant = await prisma.participant.findUnique({
    where: { id: params.toParticipantId },
  });
  if (!toParticipant || toParticipant.tabId !== params.tabId) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }
  if (toParticipant.userId !== params.userId) {
    throwApiError(403, "forbidden", "Only the receiver can confirm acknowledgement");
  }

  const acknowledgement = await prisma.settlementAcknowledgement.findUnique({
    where: {
      tabId_fromParticipantId_toParticipantId: {
        tabId: params.tabId,
        fromParticipantId: params.fromParticipantId,
        toParticipantId: params.toParticipantId,
      },
    },
  });

  if (!acknowledgement) {
    throwApiError(404, "not_found", "Acknowledgement not found");
  }

  if (acknowledgement.status === "ACKNOWLEDGED") {
    throwApiError(409, "forbidden", "Already acknowledged");
  }

  return prisma.settlementAcknowledgement.update({
    where: {
      tabId_fromParticipantId_toParticipantId: {
        tabId: params.tabId,
        fromParticipantId: params.fromParticipantId,
        toParticipantId: params.toParticipantId,
      },
    },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedByUserId: params.userId,
      acknowledgedAt: new Date(),
    },
  });
}
