import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db/prisma";
import { computeNets, computeSettlement } from "@/lib/settlement/computeSettlement";

export const alt = "PartyTab Summary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function fmtCents(cents: number): string {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default async function OGImage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const tab = await prisma.tab.findUnique({
    where: { shareToken: token },
    include: {
      participants: { select: { id: true } },
      expenses: {
        select: {
          id: true,
          paidByParticipantId: true,
          amountTotalCents: true,
          isEstimate: true,
        },
      },
      settlement: { include: { transfers: { select: { id: true } } } },
      acknowledgements: {
        select: { fromParticipantId: true, toParticipantId: true, status: true },
      },
    },
  });

  if (!tab) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#FAF8F5",
            fontFamily: "system-ui",
          }}
        >
          <div style={{ display: "flex", fontSize: "32px", color: "#6B6560" }}>Tab not found</div>
        </div>
      ),
      { ...size },
    );
  }

  const count = tab.participants.length;
  const total = tab.expenses.reduce((s, e) => s + e.amountTotalCents, 0);
  const isClosed = tab.status === "CLOSED";

  // Count transfers and settled
  let transferCount: number;
  if (isClosed && tab.settlement) {
    transferCount = tab.settlement.transfers.length;
  } else {
    const splits = await prisma.expenseSplit.findMany({
      where: { expense: { tabId: tab.id } },
      select: { expenseId: true, participantId: true, amountCents: true },
    });
    const nets = computeNets(tab.participants, tab.expenses, splits);
    const transfers = computeSettlement(nets.map((n) => ({ ...n })));
    transferCount = transfers.length;
  }

  const settledCount = tab.acknowledgements.filter((a) => a.status === "ACKNOWLEDGED").length;

  const progress =
    transferCount > 0
      ? `${settledCount} of ${transferCount} settled up`
      : "All even";

  const subtitle = `${count} people · ${fmtCents(total)} total · ${progress}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#FAF8F5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "48px 64px",
            border: "1px solid #E8E4DE",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "14px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#6B6560",
            }}
          >
            PartyTab
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "48px",
              fontWeight: "700",
              color: "#1A1815",
              marginTop: "16px",
            }}
          >
            {tab.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              color: "#6B6560",
              marginTop: "12px",
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              marginTop: "32px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#FAF8F5",
                borderRadius: "16px",
                padding: "20px 32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#6B6560",
                }}
              >
                Total
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#1A1815",
                  marginTop: "4px",
                }}
              >
                {fmtCents(total)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: "#FAF8F5",
                borderRadius: "16px",
                padding: "20px 32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "#6B6560",
                }}
              >
                People
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: "36px",
                  fontWeight: "700",
                  color: "#1A1815",
                  marginTop: "4px",
                }}
              >
                {count}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
