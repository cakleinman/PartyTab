-- Enable Row Level Security (RLS) on All Tables
-- This migration secures all 24 tables by enabling RLS and creating deny-all policies
-- for anon/authenticated roles accessing via PostgREST. Prisma operations continue
-- working as they use direct database connections that bypass RLS.

-- ============================================================================
-- CORE TABLES (PascalCase - Prisma default naming)
-- ============================================================================

-- User table (contains passwordHash, pinHash)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_user" ON "User"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_user" ON "User"
  FOR ALL TO authenticated USING (false);

-- UserClaimToken (contains sensitive token)
ALTER TABLE "UserClaimToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserClaimToken" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_user_claim_token" ON "UserClaimToken"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_user_claim_token" ON "UserClaimToken"
  FOR ALL TO authenticated USING (false);

-- Tab
ALTER TABLE "Tab" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tab" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_tab" ON "Tab"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_tab" ON "Tab"
  FOR ALL TO authenticated USING (false);

-- Participant
ALTER TABLE "Participant" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Participant" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_participant" ON "Participant"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_participant" ON "Participant"
  FOR ALL TO authenticated USING (false);

-- Expense
ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Expense" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_expense" ON "Expense"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_expense" ON "Expense"
  FOR ALL TO authenticated USING (false);

-- ExpenseSplit
ALTER TABLE "ExpenseSplit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpenseSplit" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_expense_split" ON "ExpenseSplit"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_expense_split" ON "ExpenseSplit"
  FOR ALL TO authenticated USING (false);

-- ReceiptItem
ALTER TABLE "ReceiptItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReceiptItem" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_receipt_item" ON "ReceiptItem"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_receipt_item" ON "ReceiptItem"
  FOR ALL TO authenticated USING (false);

-- ReceiptItemClaim
ALTER TABLE "ReceiptItemClaim" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReceiptItemClaim" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_receipt_item_claim" ON "ReceiptItemClaim"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_receipt_item_claim" ON "ReceiptItemClaim"
  FOR ALL TO authenticated USING (false);

-- Settlement
ALTER TABLE "Settlement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Settlement" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_settlement" ON "Settlement"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_settlement" ON "Settlement"
  FOR ALL TO authenticated USING (false);

-- SettlementTransfer
ALTER TABLE "SettlementTransfer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SettlementTransfer" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_settlement_transfer" ON "SettlementTransfer"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_settlement_transfer" ON "SettlementTransfer"
  FOR ALL TO authenticated USING (false);

-- SettlementAcknowledgement
ALTER TABLE "SettlementAcknowledgement" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SettlementAcknowledgement" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_settlement_ack" ON "SettlementAcknowledgement"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_settlement_ack" ON "SettlementAcknowledgement"
  FOR ALL TO authenticated USING (false);

-- Invite (contains sensitive token)
ALTER TABLE "Invite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invite" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_invite" ON "Invite"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_invite" ON "Invite"
  FOR ALL TO authenticated USING (false);

-- ============================================================================
-- BILLING/STRIPE TABLES (snake_case mapped)
-- ============================================================================

-- stripe_customers
ALTER TABLE "stripe_customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stripe_customers" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_stripe_customers" ON "stripe_customers"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_stripe_customers" ON "stripe_customers"
  FOR ALL TO authenticated USING (false);

-- stripe_subscriptions
ALTER TABLE "stripe_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stripe_subscriptions" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_stripe_subscriptions" ON "stripe_subscriptions"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_stripe_subscriptions" ON "stripe_subscriptions"
  FOR ALL TO authenticated USING (false);

-- stripe_events
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stripe_events" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_stripe_events" ON "stripe_events"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_stripe_events" ON "stripe_events"
  FOR ALL TO authenticated USING (false);

-- entitlements
ALTER TABLE "entitlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "entitlements" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_entitlements" ON "entitlements"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_entitlements" ON "entitlements"
  FOR ALL TO authenticated USING (false);

-- ============================================================================
-- RECEIPT TABLES (snake_case mapped)
-- ============================================================================

-- receipts
ALTER TABLE "receipts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receipts" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_receipts" ON "receipts"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_receipts" ON "receipts"
  FOR ALL TO authenticated USING (false);

-- receipt_usage
ALTER TABLE "receipt_usage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "receipt_usage" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_receipt_usage" ON "receipt_usage"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_receipt_usage" ON "receipt_usage"
  FOR ALL TO authenticated USING (false);

-- ============================================================================
-- NOTIFICATION/REMINDER TABLES (snake_case mapped)
-- ============================================================================

-- tab_reminder_settings
ALTER TABLE "tab_reminder_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tab_reminder_settings" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_reminder_settings" ON "tab_reminder_settings"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_reminder_settings" ON "tab_reminder_settings"
  FOR ALL TO authenticated USING (false);

-- tab_reminder_log
ALTER TABLE "tab_reminder_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tab_reminder_log" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_reminder_log" ON "tab_reminder_log"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_reminder_log" ON "tab_reminder_log"
  FOR ALL TO authenticated USING (false);

-- push_subscriptions (contains endpoint, p256dh, auth keys)
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_push_subscriptions" ON "push_subscriptions"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_push_subscriptions" ON "push_subscriptions"
  FOR ALL TO authenticated USING (false);

-- email_preferences
ALTER TABLE "email_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "email_preferences" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_email_preferences" ON "email_preferences"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_email_preferences" ON "email_preferences"
  FOR ALL TO authenticated USING (false);

-- in_app_notifications
ALTER TABLE "in_app_notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "in_app_notifications" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_in_app_notifications" ON "in_app_notifications"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_in_app_notifications" ON "in_app_notifications"
  FOR ALL TO authenticated USING (false);

-- ============================================================================
-- SYSTEM TABLES
-- ============================================================================

-- _prisma_migrations (Prisma's internal migration tracking)
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" FORCE ROW LEVEL SECURITY;

CREATE POLICY "deny_anon_prisma_migrations" ON "_prisma_migrations"
  FOR ALL TO anon USING (false);

CREATE POLICY "deny_authenticated_prisma_migrations" ON "_prisma_migrations"
  FOR ALL TO authenticated USING (false);
