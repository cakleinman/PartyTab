-- Add Pro billing, receipt processing, reminders, and notification tables
-- These were previously applied via `prisma db push` but never captured as migrations.

-- ============================================================================
-- ENUM
-- ============================================================================

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'PAYMENT_REMINDER');

-- ============================================================================
-- ALTER EXISTING TABLES (new columns)
-- ============================================================================

-- User: guest email capture fields
ALTER TABLE "User" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "User" ADD COLUMN "guestEmailConsentAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "guestEmailSetByUserId" UUID;

-- Tab: archive support
ALTER TABLE "Tab" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- Expense: receipt parsed totals
ALTER TABLE "Expense" ADD COLUMN "receiptSubtotalCents" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "receiptTaxCents" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "receiptTipCents" INTEGER;
ALTER TABLE "Expense" ADD COLUMN "receiptTipPercent" DOUBLE PRECISION;
ALTER TABLE "Expense" ADD COLUMN "receiptFeeCents" INTEGER;

-- ============================================================================
-- CREATE NEW TABLES
-- ============================================================================

-- CreateTable stripe_customers
CREATE TABLE "stripe_customers" (
    "user_id" UUID NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable stripe_subscriptions
CREATE TABLE "stripe_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "stripe_price_id" TEXT NOT NULL,
    "stripe_status" TEXT NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stripe_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable entitlements
CREATE TABLE "entitlements" (
    "user_id" UUID NOT NULL,
    "plan" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entitlements_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable stripe_events
CREATE TABLE "stripe_events" (
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable receipt_usage
CREATE TABLE "receipt_usage" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "month" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable receipts
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "tab_id" UUID NOT NULL,
    "image_storage_key" TEXT NOT NULL,
    "parsed_items_json" TEXT NOT NULL,
    "tax_total_cents" INTEGER NOT NULL,
    "tip_total_cents" INTEGER NOT NULL,
    "fees_total_cents" INTEGER NOT NULL,
    "allocation_json" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable tab_reminder_settings
CREATE TABLE "tab_reminder_settings" (
    "tab_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "enabled_at" TIMESTAMP(3),
    "schedule_days_json" TEXT NOT NULL DEFAULT '[3,7,14]',
    "channel_push" BOOLEAN NOT NULL DEFAULT true,
    "channel_email" BOOLEAN NOT NULL DEFAULT true,
    "created_by_user_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tab_reminder_settings_pkey" PRIMARY KEY ("tab_id")
);

-- CreateTable tab_reminder_log
CREATE TABLE "tab_reminder_log" (
    "id" UUID NOT NULL,
    "tab_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "channel" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "sent_by_user_id" UUID,
    "manual_reminder" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "tab_reminder_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable push_subscriptions
CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable email_preferences
CREATE TABLE "email_preferences" (
    "user_id" UUID NOT NULL,
    "reminder_emails_enabled" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribed_at" TIMESTAMP(3),

    CONSTRAINT "email_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable in_app_notifications
CREATE TABLE "in_app_notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "url" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "in_app_notifications_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- UNIQUE INDEXES
-- ============================================================================

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_subscriptions_stripe_subscription_id_key" ON "stripe_subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_events_event_id_key" ON "stripe_events"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_usage_user_id_month_key" ON "receipt_usage"("user_id", "month");

-- CompositeIndex
CREATE INDEX "in_app_notifications_user_id_read_idx" ON "in_app_notifications"("user_id", "read");

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- AddForeignKey
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stripe_subscriptions" ADD CONSTRAINT "stripe_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entitlements" ADD CONSTRAINT "entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_usage" ADD CONSTRAINT "receipt_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_reminder_settings" ADD CONSTRAINT "tab_reminder_settings_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_reminder_settings" ADD CONSTRAINT "tab_reminder_settings_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_reminder_log" ADD CONSTRAINT "tab_reminder_log_tab_id_fkey" FOREIGN KEY ("tab_id") REFERENCES "Tab"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_reminder_log" ADD CONSTRAINT "tab_reminder_log_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tab_reminder_log" ADD CONSTRAINT "tab_reminder_log_sent_by_user_id_fkey" FOREIGN KEY ("sent_by_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_preferences" ADD CONSTRAINT "email_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "in_app_notifications" ADD CONSTRAINT "in_app_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
