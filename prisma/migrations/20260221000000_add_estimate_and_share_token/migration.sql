-- AlterTable: Add isEstimate to Expense
ALTER TABLE "Expense" ADD COLUMN "isEstimate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Add shareToken to Tab
ALTER TABLE "Tab" ADD COLUMN "shareToken" TEXT;

-- CreateIndex: Unique constraint on shareToken
CREATE UNIQUE INDEX "Tab_shareToken_key" ON "Tab"("shareToken");
