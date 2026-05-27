-- Add IDKYP feature tables: monthly usage tracking and decision log.
-- Both tables follow the snake_case @@map convention used by receipt_usage,
-- entitlements, etc. RLS deny-all policies follow the lockdown established in
-- 20260202030000_enable_rls (anon/authenticated blocked via PostgREST; Prisma
-- continues to work because it uses a role that bypasses RLS).

-- ============================================================================
-- CREATE NEW TABLES
-- ============================================================================

-- CreateTable idkyp_usage
CREATE TABLE "idkyp_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idkyp_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable idkyp_decision
CREATE TABLE "idkyp_decision" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "winner_place_id" TEXT NOT NULL,
    "winner_name" TEXT NOT NULL,
    "winner_lat" DOUBLE PRECISION NOT NULL,
    "winner_lng" DOUBLE PRECISION NOT NULL,
    "filters_snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idkyp_decision_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- CreateIndex
CREATE UNIQUE INDEX "idkyp_usage_user_id_month_key" ON "idkyp_usage"("user_id", "month");

-- CreateIndex
CREATE INDEX "idkyp_decision_user_id_created_at_idx" ON "idkyp_decision"("user_id", "created_at");

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- AddForeignKey
ALTER TABLE "idkyp_usage" ADD CONSTRAINT "idkyp_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idkyp_decision" ADD CONSTRAINT "idkyp_decision_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================================
-- ROW LEVEL SECURITY (deny-all on anon + authenticated)
-- ============================================================================

ALTER TABLE "idkyp_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idkyp_usage" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_idkyp_usage" ON "idkyp_usage"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_idkyp_usage" ON "idkyp_usage"
  FOR ALL TO authenticated USING (false);

ALTER TABLE "idkyp_decision" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "idkyp_decision" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_idkyp_decision" ON "idkyp_decision"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_idkyp_decision" ON "idkyp_decision"
  FOR ALL TO authenticated USING (false);
