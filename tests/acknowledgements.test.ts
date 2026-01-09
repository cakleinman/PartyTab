import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { PrismaClient, TabStatus } from "@prisma/client";
import { confirmAcknowledgement, initiateAcknowledgement } from "@/lib/settlement/acknowledgement";
import { resetDatabase } from "@/lib/dev/seed";

const databaseUrl = process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
const runDbTests = ["1", "true", "yes"].includes(
  (process.env.RUN_DB_TESTS ?? "").toLowerCase()
);

if (runDbTests && databaseUrl) {
  process.env.DATABASE_URL = databaseUrl;
}

const prisma = runDbTests && databaseUrl ? new PrismaClient() : null;

describe("settlement acknowledgements", () => {
  if (!runDbTests || !databaseUrl || !prisma) {
    it.skip("RUN_DB_TESTS not set or DATABASE_URL missing", () => {});
    return;
  }

  let closedTabId: string;
  let activeTabId: string;
  let payerUserId: string;
  let receiverUserId: string;
  let payerParticipantId: string;
  let receiverParticipantId: string;

  beforeAll(async () => {
    await resetDatabase(prisma);

    const payer = await prisma.user.create({ data: { displayName: "Payer" } });
    const receiver = await prisma.user.create({ data: { displayName: "Receiver" } });

    payerUserId = payer.id;
    receiverUserId = receiver.id;

    const closedTab = await prisma.tab.create({
      data: {
        name: "Closed Tab",
        createdByUserId: payer.id,
        status: TabStatus.CLOSED,
        closedAt: new Date(),
        participants: {
          create: [{ userId: payer.id }, { userId: receiver.id }],
        },
      },
      include: { participants: true },
    });

    const activeTab = await prisma.tab.create({
      data: {
        name: "Active Tab",
        createdByUserId: payer.id,
        status: TabStatus.ACTIVE,
        participants: {
          create: [{ userId: payer.id }, { userId: receiver.id }],
        },
      },
      include: { participants: true },
    });

    closedTabId = closedTab.id;
    activeTabId = activeTab.id;

    payerParticipantId = closedTab.participants.find((p) => p.userId === payer.id)!.id;
    receiverParticipantId = closedTab.participants.find((p) => p.userId === receiver.id)!.id;

    await prisma.settlement.create({
      data: {
        tabId: closedTab.id,
        transfers: {
          create: [{
            fromParticipantId: payerParticipantId,
            toParticipantId: receiverParticipantId,
            amountCents: 1200,
          }],
        },
      },
    });
  });

  afterAll(async () => {
    await resetDatabase(prisma);
    await prisma.$disconnect();
  });

  it("cannot initiate when tab is active", async () => {
    await expect(
      initiateAcknowledgement(prisma, {
        tabId: activeTabId,
        userId: payerUserId,
        fromParticipantId: payerParticipantId,
        toParticipantId: receiverParticipantId,
      }),
    ).rejects.toMatchObject({ code: "tab_closed" });
  });

  it("only payer can initiate", async () => {
    await expect(
      initiateAcknowledgement(prisma, {
        tabId: closedTabId,
        userId: receiverUserId,
        fromParticipantId: payerParticipantId,
        toParticipantId: receiverParticipantId,
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("cannot initiate without matching transfer", async () => {
    // When reversing from/to, the payer user isn't the "from" participant
    // so they can't initiate (permission check fails before transfer lookup)
    await expect(
      initiateAcknowledgement(prisma, {
        tabId: closedTabId,
        userId: payerUserId,
        fromParticipantId: receiverParticipantId,
        toParticipantId: payerParticipantId,
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("only receiver can confirm", async () => {
    await initiateAcknowledgement(prisma, {
      tabId: closedTabId,
      userId: payerUserId,
      fromParticipantId: payerParticipantId,
      toParticipantId: receiverParticipantId,
    });

    await expect(
      confirmAcknowledgement(prisma, {
        tabId: closedTabId,
        userId: payerUserId,
        fromParticipantId: payerParticipantId,
        toParticipantId: receiverParticipantId,
      }),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("acknowledgement can be confirmed", async () => {
    const updated = await confirmAcknowledgement(prisma, {
      tabId: closedTabId,
      userId: receiverUserId,
      fromParticipantId: payerParticipantId,
      toParticipantId: receiverParticipantId,
    });

    expect(updated.status).toBe("ACKNOWLEDGED");
    expect(updated.acknowledgedAt).toBeTruthy();
  });
});
