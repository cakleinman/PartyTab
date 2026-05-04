/**
 * One-shot cleanup: recompute ExpenseSplit rows for receipt-based expenses
 * whose splits are still the (0¢, 1¢) placeholder created when the expense
 * was first uploaded but never recomputed from claims.
 *
 * Also reconciles amountTotalCents = sum(splits) so dashboard totals match
 * what people actually owe (fixes the doubled-tip case where the parse route
 * had bumped the total above the real claim sum).
 *
 * Safe to re-run: skips expenses whose splits already sum to amountTotalCents
 * AND look claim-derived (sum of splits > 1¢).
 *
 * Usage:
 *   npx tsx scripts/recompute-receipt-splits.ts            # dry-run, prints diffs
 *   npx tsx scripts/recompute-receipt-splits.ts --apply    # actually writes
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { computeClaimSplits } from "../lib/receipts/computeClaimSplits";

const APPLY = process.argv.includes("--apply");
const ALLOW_PROD = process.argv.includes("--allow-prod");

async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  const looksProd =
    process.env.NODE_ENV === "production" ||
    dbUrl.includes(".supabase.com") ||
    dbUrl.includes("pooler.supabase.com");
  if (APPLY && looksProd && !ALLOW_PROD) {
    console.error(
      "\nRefusing to --apply against what looks like a production DB.\n" +
        "Re-run with --allow-prod if this is intentional, or point\n" +
        "DATABASE_URL at a non-production target.\n",
    );
    process.exit(2);
  }

  const prisma = new PrismaClient();

  const expenses = await prisma.expense.findMany({
    where: {
      receiptItems: { some: {} },
    },
    include: {
      splits: true,
      receiptItems: {
        include: { claims: true },
      },
    },
  });

  let touched = 0;
  let skipped = 0;

  for (const expense of expenses) {
    const newSplits = computeClaimSplits({
      items: expense.receiptItems.map((item) => ({
        priceCents: item.priceCents,
        claimedBy: item.claims.map((c) => ({ participantId: c.participantId })),
      })),
      taxCents: expense.receiptTaxCents ?? 0,
      feeCents: expense.receiptFeeCents ?? 0,
      tipCents: expense.receiptTipCents ?? 0,
    });

    if (newSplits.length === 0) {
      console.log(`SKIP ${expense.id}: no claims yet (would orphan splits)`);
      skipped++;
      continue;
    }

    const newTotal = newSplits.reduce((s, x) => s + x.amountCents, 0);
    const oldTotal = expense.splits.reduce((s, x) => s + x.amountCents, 0);

    const splitsAreSame =
      expense.splits.length === newSplits.length &&
      newSplits.every((ns) => {
        const old = expense.splits.find(
          (os) => os.participantId === ns.participantId,
        );
        return old?.amountCents === ns.amountCents;
      });
    const amountMatches = expense.amountTotalCents === newTotal;

    if (splitsAreSame && amountMatches) {
      skipped++;
      continue;
    }

    console.log(
      `\n${expense.id} (${expense.note ?? "(no note)"}, ${expense.date.toISOString().slice(0, 10)})`,
    );
    console.log(
      `  amountTotalCents: ${expense.amountTotalCents} -> ${newTotal} (delta ${newTotal - expense.amountTotalCents})`,
    );
    console.log(`  oldSplits sum=${oldTotal}:`);
    for (const s of expense.splits) {
      console.log(`    ${s.participantId}: ${s.amountCents}`);
    }
    console.log(`  newSplits sum=${newTotal}:`);
    for (const s of newSplits) {
      console.log(`    ${s.participantId}: ${s.amountCents}`);
    }

    if (APPLY) {
      await prisma.$transaction([
        prisma.expenseSplit.deleteMany({ where: { expenseId: expense.id } }),
        prisma.expenseSplit.createMany({
          data: newSplits.map((s) => ({
            expenseId: expense.id,
            participantId: s.participantId,
            amountCents: s.amountCents,
          })),
        }),
        prisma.expense.update({
          where: { id: expense.id },
          data: { amountTotalCents: newTotal },
        }),
      ]);
    }

    touched++;
  }

  console.log(
    `\n${APPLY ? "APPLIED" : "DRY RUN"}: ${touched} expenses ${APPLY ? "updated" : "would be updated"}, ${skipped} skipped, ${expenses.length} scanned.`,
  );
  if (!APPLY && touched > 0) {
    console.log("Re-run with --apply to write changes.");
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
