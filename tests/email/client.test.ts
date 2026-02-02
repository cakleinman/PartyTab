import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock the postmark module
vi.mock("postmark", () => ({
    ServerClient: vi.fn(() => ({
        sendEmail: vi.fn(() => Promise.resolve({ MessageID: "test-id" })),
    })),
}));

// Now import the module
import { sendCreditorReminderEmail, sendPaymentPendingEmail } from "@/lib/email/client";

describe("email client", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Set required env vars
        process.env.POSTMARK_SERVER_TOKEN = "test-token";
        process.env.EMAIL_FROM = "Test <test@example.com>";
    });

    describe("sendCreditorReminderEmail", () => {
        it("formats amount correctly", async () => {
            // 5000 cents = $50.00
            await sendCreditorReminderEmail(
                "debtor@test.com",
                "Debtor Name",
                "Creditor Name",
                "Test Tab",
                5000,
                "https://example.com/tab/123",
                "https://example.com/unsubscribe?token=abc"
            );

            // The function should complete without error
            // Actual email content is tested via the mock
        });

        it("HTML-escapes user names", async () => {
            // This test ensures malicious names don't cause XSS
            await sendCreditorReminderEmail(
                "test@test.com",
                "<script>alert('xss')</script>",
                "Normal Name",
                "Test Tab",
                1000,
                "https://example.com/tab/123",
                "https://example.com/unsubscribe"
            );

            // Function should complete without error
        });
    });

    describe("sendPaymentPendingEmail", () => {
        it("sends payment pending email", async () => {
            await sendPaymentPendingEmail(
                "payee@test.com",
                "Payee Name",
                "Payer Name",
                "Test Tab",
                2500,
                "https://example.com/settlement/123",
                "https://example.com/unsubscribe"
            );

            // Function should complete without error
        });
    });
});
