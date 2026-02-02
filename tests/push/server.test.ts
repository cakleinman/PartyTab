import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock web-push module
vi.mock("web-push", () => ({
    default: {
        setVapidDetails: vi.fn(),
        sendNotification: vi.fn(),
    },
}));

import webpush from "web-push";
import { sendPushNotification } from "@/lib/push/server";

describe("push server", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("sends push notification successfully", async () => {
        vi.mocked(webpush.sendNotification).mockResolvedValue({} as never);

        const result = await sendPushNotification(
            { endpoint: "https://push.example.com", keys: { p256dh: "key", auth: "auth" } },
            JSON.stringify({ title: "Test", body: "Message" })
        );

        expect(result.success).toBe(true);
        expect(webpush.sendNotification).toHaveBeenCalled();
    });

    it("handles expired subscription (410)", async () => {
        const error = new Error("Gone") as Error & { statusCode: number };
        error.statusCode = 410;
        vi.mocked(webpush.sendNotification).mockRejectedValue(error);

        const result = await sendPushNotification(
            { endpoint: "https://push.example.com", keys: { p256dh: "key", auth: "auth" } },
            JSON.stringify({ title: "Test", body: "Message" })
        );

        expect(result.success).toBe(false);
        expect(result.expired).toBe(true);
    });

    it("handles network errors gracefully", async () => {
        vi.mocked(webpush.sendNotification).mockRejectedValue(new Error("Network timeout"));

        const result = await sendPushNotification(
            { endpoint: "https://push.example.com", keys: { p256dh: "key", auth: "auth" } },
            JSON.stringify({ title: "Test", body: "Message" })
        );

        expect(result.success).toBe(false);
        expect(result.expired).toBeUndefined();
    });

    it("includes correct payload format", async () => {
        vi.mocked(webpush.sendNotification).mockResolvedValue({} as never);

        const payload = JSON.stringify({
            title: "Payment Reminder",
            body: "You owe $50.00",
            url: "/tabs/123",
        });

        await sendPushNotification(
            { endpoint: "https://push.example.com", keys: { p256dh: "key", auth: "auth" } },
            payload
        );

        expect(webpush.sendNotification).toHaveBeenCalledWith(
            expect.objectContaining({ endpoint: "https://push.example.com" }),
            payload
        );
    });
});
