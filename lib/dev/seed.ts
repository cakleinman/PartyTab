import { PrismaClient, TabStatus } from "@prisma/client";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";

export async function resetDatabase(prisma: PrismaClient) {
  // Delete in order of dependencies (children before parents)

  // Notifications and reminders
  await prisma.inAppNotification.deleteMany();
  await prisma.tabReminderLog.deleteMany();
  await prisma.tabReminderSetting.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.emailPreference.deleteMany();

  // Receipts
  await prisma.receiptItemClaim.deleteMany();
  await prisma.receiptItem.deleteMany();
  await prisma.receipt.deleteMany();
  await prisma.receiptUsage.deleteMany();

  // Billing
  await prisma.stripeSubscription.deleteMany();
  await prisma.stripeCustomer.deleteMany();
  await prisma.entitlement.deleteMany();

  // Settlement
  await prisma.settlementAcknowledgement.deleteMany();
  await prisma.settlementTransfer.deleteMany();
  await prisma.settlement.deleteMany();

  // Expenses
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();

  // Core entities
  await prisma.invite.deleteMany();
  await prisma.userClaimToken.deleteMany();
  await prisma.participant.deleteMany();
  await prisma.tab.deleteMany();
  await prisma.user.deleteMany();
}

export async function seedDemo(prisma: PrismaClient) {
  await prisma.user.createMany({
    data: [
      { displayName: "Host" },
      { displayName: "Avery" },
      { displayName: "Jordan" },
      { displayName: "Sam" },
      { displayName: "Riley" },
    ],
  });

  const allUsers = await prisma.user.findMany();
  const [host, avery, jordan, sam, riley] = allUsers;

  const activeTab = await prisma.tab.create({
    data: {
      name: "Seeded Weekend",
      description: "Active demo tab",
      createdByUserId: host.id,
      participants: {
        create: [
          { userId: host.id },
          { userId: avery.id },
          { userId: jordan.id },
          { userId: sam.id },
        ],
      },
    },
    include: { participants: true },
  });

  const [pHost, pAvery, pJordan, pSam] = activeTab.participants;

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 7800,
      note: "Groceries",
      paidByParticipantId: pHost.id,
      createdByUserId: host.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 1950 },
          { participantId: pAvery.id, amountCents: 1950 },
          { participantId: pJordan.id, amountCents: 1950 },
          { participantId: pSam.id, amountCents: 1950 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 4200,
      note: "Gas",
      paidByParticipantId: pAvery.id,
      createdByUserId: avery.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 1400 },
          { participantId: pAvery.id, amountCents: 1400 },
          { participantId: pJordan.id, amountCents: 1400 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 2600,
      note: "Snacks",
      paidByParticipantId: pJordan.id,
      createdByUserId: jordan.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 650 },
          { participantId: pAvery.id, amountCents: 650 },
          { participantId: pJordan.id, amountCents: 650 },
          { participantId: pSam.id, amountCents: 650 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 5100,
      note: "Dinner",
      paidByParticipantId: pSam.id,
      createdByUserId: sam.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 1700 },
          { participantId: pSam.id, amountCents: 1700 },
          { participantId: pJordan.id, amountCents: 1700 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 3400,
      note: "Supplies",
      paidByParticipantId: pHost.id,
      createdByUserId: host.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 850 },
          { participantId: pAvery.id, amountCents: 850 },
          { participantId: pJordan.id, amountCents: 850 },
          { participantId: pSam.id, amountCents: 850 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: activeTab.id,
      amountTotalCents: 2400,
      note: "Coffee run",
      paidByParticipantId: pAvery.id,
      createdByUserId: avery.id,
      splits: {
        create: [
          { participantId: pHost.id, amountCents: 600 },
          { participantId: pAvery.id, amountCents: 600 },
          { participantId: pJordan.id, amountCents: 600 },
          { participantId: pSam.id, amountCents: 600 },
        ],
      },
    },
  });

  await prisma.invite.create({
    data: {
      tabId: activeTab.id,
      token: "seed-invite-token",
      createdByUserId: host.id,
    },
  });

  const closedTab = await prisma.tab.create({
    data: {
      name: "Closed Demo Tab",
      description: "Closed tab with settlement transfers",
      createdByUserId: riley.id,
      status: TabStatus.CLOSED,
      closedAt: new Date(),
      participants: {
        create: [
          { userId: riley.id },
          { userId: avery.id },
          { userId: jordan.id },
        ],
      },
    },
    include: { participants: true },
  });

  const [pRiley, pAveryClosed, pJordanClosed] = closedTab.participants;

  await prisma.expense.create({
    data: {
      tabId: closedTab.id,
      amountTotalCents: 6000,
      note: "Lodging",
      paidByParticipantId: pRiley.id,
      createdByUserId: riley.id,
      splits: {
        create: [
          { participantId: pRiley.id, amountCents: 2000 },
          { participantId: pAveryClosed.id, amountCents: 2000 },
          { participantId: pJordanClosed.id, amountCents: 2000 },
        ],
      },
    },
  });

  await prisma.expense.create({
    data: {
      tabId: closedTab.id,
      amountTotalCents: 2400,
      note: "Tickets",
      paidByParticipantId: pJordanClosed.id,
      createdByUserId: jordan.id,
      splits: {
        create: [
          { participantId: pRiley.id, amountCents: 800 },
          { participantId: pAveryClosed.id, amountCents: 800 },
          { participantId: pJordanClosed.id, amountCents: 800 },
        ],
      },
    },
  });

  const [closedExpenses, closedSplits] = await Promise.all([
    prisma.expense.findMany({
      where: { tabId: closedTab.id },
      select: { id: true, paidByParticipantId: true, amountTotalCents: true },
    }),
    prisma.expenseSplit.findMany({
      where: { expense: { tabId: closedTab.id } },
      select: { expenseId: true, participantId: true, amountCents: true },
    }),
  ]);

  const nets = computeNets(closedTab.participants, closedExpenses, closedSplits);
  const transfers = computeSettlement(nets.map((net) => ({ ...net })));

  const settlement = await prisma.settlement.create({
    data: {
      tabId: closedTab.id,
      transfers: {
        create: transfers.map((transfer) => ({
          fromParticipantId: transfer.fromParticipantId,
          toParticipantId: transfer.toParticipantId,
          amountCents: transfer.amountCents,
        })),
      },
    },
    include: { transfers: true },
  });

  const participantById = new Map(
    closedTab.participants.map((participant) => [participant.id, participant]),
  );

  if (settlement.transfers.length > 0) {
    const first = settlement.transfers[0];
    const fromParticipant = participantById.get(first.fromParticipantId);
    const toParticipant = participantById.get(first.toParticipantId);
    if (!fromParticipant || !toParticipant) {
      throw new Error("Seed participants missing for acknowledgement");
    }
    await prisma.settlementAcknowledgement.create({
      data: {
        tabId: closedTab.id,
        fromParticipantId: first.fromParticipantId,
        toParticipantId: first.toParticipantId,
        amountCents: first.amountCents,
        status: "PENDING",
        initiatedByUserId: fromParticipant.userId,
        initiatedAt: new Date(),
      },
    });
  }

  if (settlement.transfers.length > 1) {
    const second = settlement.transfers[1];
    const fromParticipant = participantById.get(second.fromParticipantId);
    const toParticipant = participantById.get(second.toParticipantId);
    if (!fromParticipant || !toParticipant) {
      throw new Error("Seed participants missing for acknowledgement");
    }
    await prisma.settlementAcknowledgement.create({
      data: {
        tabId: closedTab.id,
        fromParticipantId: second.fromParticipantId,
        toParticipantId: second.toParticipantId,
        amountCents: second.amountCents,
        status: "ACKNOWLEDGED",
        initiatedByUserId: fromParticipant.userId,
        initiatedAt: new Date(),
        acknowledgedByUserId: toParticipant.userId,
        acknowledgedAt: new Date(),
      },
    });
  }

  return {
    activeTabId: activeTab.id,
    closedTabId: closedTab.id,
  };
}
