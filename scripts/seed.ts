import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resetDatabase, seedDemo } from "../lib/dev/seed";

// ── Safety: never run seed/reset against production ──
const dbUrl = process.env.DATABASE_URL || "";
const isProduction =
  process.env.NODE_ENV === "production" ||
  dbUrl.includes(".supabase.com") ||
  dbUrl.includes("pooler.supabase.com");

if (isProduction) {
  console.error(
    "\n🚫 REFUSED: seed script detected a production database URL.\n" +
      "   Set DATABASE_URL to a local database (e.g. localhost:5433) before seeding.\n" +
      "   To override this safety check, set ALLOW_PRODUCTION_SEED=true\n",
  );
  if (process.env.ALLOW_PRODUCTION_SEED !== "true") {
    process.exit(1);
  }
  console.warn("⚠️  ALLOW_PRODUCTION_SEED=true — proceeding against production DB\n");
}

const prisma = new PrismaClient();

async function main() {
  const shouldReset = process.env.SEED_RESET === "true";
  if (shouldReset) {
    await resetDatabase(prisma);
  }
  const result = await seedDemo(prisma);
  console.log("Seed data created:");
  console.log(`Active tab: ${result.activeTabId}`);
  console.log(`Closed tab: ${result.closedTabId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
