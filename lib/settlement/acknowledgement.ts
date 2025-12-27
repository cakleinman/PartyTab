import type { PrismaClient } from "@prisma/client";
import { throwApiError } from "@/lib/api/errors";

export async function listAcknowledgements(
  prisma: PrismaClient,
  tabId: string,
  userId: string,
) {
  const tab = await prisma.tab.findUnique({ where: { id: tabId } });
  if (!tab) {
    throwApiError(404, "not_found", "Tab not found");
  }
  if (tab.status !== "CLOSED") {
    throwApiError(409, "tab_closed", "Tab is not closed");
  }

  const participant = await prisma.participant.findUnique({
    where: { tabId_userId: { tabId, userId } },
  });
  if (!participant) {
    throwApiError(403, "not_participant", "Not a participant in this tab");
  }

  const settlement = await prisma.settlement.findUnique({
    where: { tabId },
    include: { transfers: true },
  });

  if (!settlement) {
    throwApiError(404, "not_found", "Settlement not found");
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

  return settlement.transfers.map((transfer) => {
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
  if (tab.status !== "CLOSED") {
    throwApiError(409, "tab_closed", "Tab is not closed");
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
      amountCents: transfer.amountCents,
      initiatedByUserId: params.userId,
      initiatedAt: new Date(),
      acknowledgedByUserId: null,
      acknowledgedAt: null,
    },
    create: {
      tabId: params.tabId,
      fromParticipantId: params.fromParticipantId,
      toParticipantId: params.toParticipantId,
      amountCents: transfer.amountCents,
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
  if (tab.status !== "CLOSED") {
    throwApiError(409, "tab_closed", "Tab is not closed");
  }

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
