-- Phase 4 of the security hardening plan: per-account lockout.
-- Step A: add the columns nullable + backfill. Step B (next migration)
-- tightens NOT NULL + DEFAULT once every row is populated.

ALTER TABLE "User"
  ADD COLUMN "failedLoginAttempts" INTEGER,
  ADD COLUMN "lockedUntil" TIMESTAMP(3);

UPDATE "User"
  SET "failedLoginAttempts" = 0
  WHERE "failedLoginAttempts" IS NULL;
