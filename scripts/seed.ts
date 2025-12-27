import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { resetDatabase, seedDemo } from "../lib/dev/seed";

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
