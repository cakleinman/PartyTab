import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock dependencies before importing
vi.mock("@/lib/db/prisma", () => ({
    prisma: {
        tabReminderLog: {
            findFirst: vi.fn(),
            create: vi.fn(),
        },
        pushSubscription: {
            update: vi.fn(),
        },
    },
}));

vi.mock("@/lib/push/server", () => ({
    sendPushNotification: vi.fn(),
}));

vi.mock("@/lib/email/client", () => ({
    sendCreditorReminderEmail: vi.fn(),
}));

vi.mock("@/lib/notifications/create", () => ({
    createInAppNotification: vi.fn(),
}));

import { processTabReminders } from "@/lib/reminders/runner";
import { prisma } from "@/lib/db/prisma";
import { sendPushNotification } from "@/lib/push/server";
import { sendCreditorReminderEmail } from "@/lib/email/client";
import { createInAppNotification } from "@/lib/notifications/create";

// Helper to create mock data
function createMockTab(overrides = {}) {
    return {
        id: "tab-1",
        name: "Test Tab",
        description: null,
        status: "ACTIVE",
        startDate: new Date(),
        endDate: null,
        createdByUserId: "user-1",
        createdAt: new Date(),
        closedAt: null,
        archivedAt: null,
        participants: [],
        expenses: [],
        ...overrides,
    };
}

function createMockParticipant(id: string, userId: string, isPro = false, overrides: Record<string, unknown> = {}) {
    const { user: userOverrides, ...restOverrides } = overrides as { user?: Record<string, unknown> };

    const baseUser = {
        id: userId,
        displayName: `User ${userId}`,
        email: `${userId}@test.com`,
        phone: null,
        guestEmail: null,
        guestEmailConsentAt: null,
        guestEmailSetByUserId: null,
        authProvider: "EMAIL",
        subscriptionTier: isPro ? "PRO" : "BASIC",
        googleId: null,
        passwordHash: null,
        pinHash: null,
        linkedFromId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        pushSubscriptions: [],
        emailPreference: { reminderEmailsEnabled: true },
    };

    return {
        id,
        tabId: "tab-1",
        userId,
        joinedAt: new Date(),
        user: userOverrides ? { ...baseUser, ...userOverrides } : baseUser,
        ...restOverrides,
    };
}

function createMockSetting() {
    return {
        tabId: "tab-1",
        enabled: true,
        enabledAt: new Date(),
        scheduleDaysJson: "[3,7,14]",
        channelPush: true,
        channelEmail: true,
        createdByUserId: "user-1",
        updatedAt: new Date(),
    };
}

describe("reminder runner", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(prisma.tabReminderLog.findFirst).mockResolvedValue(null);
        vi.mocked(prisma.tabReminderLog.create).mockResolvedValue({} as never);
        vi.mocked(sendPushNotification).mockResolvedValue({ success: false });
        vi.mocked(sendCreditorReminderEmail).mockResolvedValue();
        vi.mocked(createInAppNotification).mockResolvedValue({} as never);
    });

    describe("debtor/creditor identification", () => {
        it("identifies creditors with positive net balance", async () => {
            // Creditor paid $100, split evenly with debtor
            // Creditor: paid 10000, owes 5000 = net +5000 (creditor)
            // Debtor: paid 0, owes 5000 = net -5000 (debtor)
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Should send reminder to debtor
            expect(createInAppNotification).toHaveBeenCalledWith(
                "user-2",
                "PAYMENT_REMINDER",
                expect.stringContaining("User user-1"),
                expect.stringContaining("$50.00"),
                expect.stringContaining("/tabs/tab-1")
            );
        });

        it("skips users with zero balance", async () => {
            // Both participants paid their own shares
            const user1 = createMockParticipant("p1", "user-1", true);
            const user2 = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [user1, user2],
                expenses: [
                    {
                        id: "exp-1",
                        tabId: "tab-1",
                        paidByParticipantId: "p1",
                        amountTotalCents: 5000,
                        splits: [{ expenseId: "exp-1", participantId: "p1", amountCents: 5000 }],
                    },
                    {
                        id: "exp-2",
                        tabId: "tab-1",
                        paidByParticipantId: "p2",
                        amountTotalCents: 5000,
                        splits: [{ expenseId: "exp-2", participantId: "p2", amountCents: 5000 }],
                    },
                ],
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // No reminders sent - everyone is settled
            expect(createInAppNotification).not.toHaveBeenCalled();
        });

        it("only sends reminders from Pro creditors", async () => {
            // Non-Pro creditor paid, should not send reminders
            const creditor = createMockParticipant("p1", "user-1", false); // NOT Pro
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // No reminders - creditor is not Pro
            expect(createInAppNotification).not.toHaveBeenCalled();
        });
    });

    describe("48-hour cooldown", () => {
        it("respects 48-hour cooldown", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            // Reminder was sent 24 hours ago
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            vi.mocked(prisma.tabReminderLog.findFirst).mockResolvedValue({
                id: "log-1",
                tabId: "tab-1",
                recipientUserId: "user-2",
                channel: "email",
                sentAt: twentyFourHoursAgo,
                status: "sent",
                reason: null,
                sentByUserId: "user-1",
                manualReminder: false,
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Should skip due to cooldown
            expect(results.skipped).toBe(1);
            expect(createInAppNotification).not.toHaveBeenCalled();
        });

        it("sends reminder after cooldown expires", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            // Reminder was sent 49 hours ago
            const fortyNineHoursAgo = new Date(Date.now() - 49 * 60 * 60 * 1000);
            vi.mocked(prisma.tabReminderLog.findFirst).mockResolvedValue({
                id: "log-1",
                tabId: "tab-1",
                recipientUserId: "user-2",
                channel: "email",
                sentAt: fortyNineHoursAgo,
                status: "sent",
                reason: null,
                sentByUserId: "user-1",
                manualReminder: false,
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Should send reminder - cooldown expired
            expect(createInAppNotification).toHaveBeenCalled();
        });

        it("force=true bypasses cooldown", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            // Reminder was sent 1 hour ago
            const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
            vi.mocked(prisma.tabReminderLog.findFirst).mockResolvedValue({
                id: "log-1",
                tabId: "tab-1",
                recipientUserId: "user-2",
                channel: "email",
                sentAt: oneHourAgo,
                status: "sent",
                reason: null,
                sentByUserId: "user-1",
                manualReminder: false,
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            // Force = true should bypass cooldown
            await processTabReminders(tab as never, setting as never, results, true);

            // Should send reminder despite cooldown
            expect(createInAppNotification).toHaveBeenCalled();
        });
    });

    describe("channel fallback", () => {
        it("tries push first when subscription exists", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false, {
                user: {
                    id: "user-2",
                    displayName: "User user-2",
                    email: "user-2@test.com",
                    subscriptionTier: "BASIC",
                    pushSubscriptions: [
                        { id: "push-1", endpoint: "https://push.example.com", p256dh: "key", auth: "auth", revokedAt: null },
                    ],
                    emailPreference: { reminderEmailsEnabled: true },
                },
            });

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            vi.mocked(sendPushNotification).mockResolvedValue({ success: true });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Push should be attempted
            expect(sendPushNotification).toHaveBeenCalled();
            // In-app always created
            expect(createInAppNotification).toHaveBeenCalled();
        });

        it("falls back to email when push fails", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false, {
                user: {
                    id: "user-2",
                    displayName: "User user-2",
                    email: "user-2@test.com",
                    subscriptionTier: "BASIC",
                    pushSubscriptions: [
                        { id: "push-1", endpoint: "https://push.example.com", p256dh: "key", auth: "auth", revokedAt: null },
                    ],
                    emailPreference: { reminderEmailsEnabled: true },
                },
            });

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            vi.mocked(sendPushNotification).mockResolvedValue({ success: false });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Push attempted
            expect(sendPushNotification).toHaveBeenCalled();
            // Email fallback
            expect(sendCreditorReminderEmail).toHaveBeenCalled();
        });

        it("creates in-app notification regardless", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false);

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // In-app always created
            expect(createInAppNotification).toHaveBeenCalledWith(
                "user-2",
                "PAYMENT_REMINDER",
                expect.any(String),
                expect.any(String),
                expect.any(String)
            );
        });

        it("skips email if user unsubscribed", async () => {
            const creditor = createMockParticipant("p1", "user-1", true);
            const debtor = createMockParticipant("p2", "user-2", false, {
                user: {
                    id: "user-2",
                    displayName: "User user-2",
                    email: "user-2@test.com",
                    subscriptionTier: "BASIC",
                    pushSubscriptions: [],
                    emailPreference: { reminderEmailsEnabled: false }, // Unsubscribed
                },
            });

            const tab = createMockTab({
                participants: [creditor, debtor],
                expenses: [{
                    id: "exp-1",
                    tabId: "tab-1",
                    paidByParticipantId: "p1",
                    amountTotalCents: 10000,
                    splits: [
                        { expenseId: "exp-1", participantId: "p1", amountCents: 5000 },
                        { expenseId: "exp-1", participantId: "p2", amountCents: 5000 },
                    ],
                }],
            });

            const setting = createMockSetting();
            const results = { sent: 0, skipped: 0, failed: 0 };

            await processTabReminders(tab as never, setting as never, results);

            // Email should NOT be sent
            expect(sendCreditorReminderEmail).not.toHaveBeenCalled();
            // In-app still created
            expect(createInAppNotification).toHaveBeenCalled();
        });
    });
});
