-- Enable RLS on payment_methods (added after the 2026-02-02 RLS lockdown).
-- Follows the same deny-all pattern as 20260202030000_enable_rls: anon and
-- authenticated roles via PostgREST get blocked; Prisma keeps working because
-- it connects with a role that bypasses RLS.

ALTER TABLE "payment_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payment_methods" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_payment_methods" ON "payment_methods"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_payment_methods" ON "payment_methods"
  FOR ALL TO authenticated USING (false);
