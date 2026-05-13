-- Phase 4 step B: tighten the lockout columns now that every row is backfilled.

ALTER TABLE "User"
  ALTER COLUMN "failedLoginAttempts" SET NOT NULL,
  ALTER COLUMN "failedLoginAttempts" SET DEFAULT 0;
