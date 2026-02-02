import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/db/prisma", () => ({
    prisma: {
        inAppNotification: {
            create: vi.fn(),
        },
    },
}));

import { createInAppNotification } from "@/lib/notifications/create";
import { prisma } from "@/lib/db/prisma";

describe("in-app notifications", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("creates notification with correct type", async () => {
        vi.mocked(prisma.inAppNotification.create).mockResolvedValue({
            id: "notif-1",
            userId: "user-1",
            type: "PAYMENT_REMINDER",
            title: "Test Title",
            body: "Test Body",
            url: null,
            read: false,
            createdAt: new Date(),
        });

        await createInAppNotification(
            "user-1",
            "PAYMENT_REMINDER",
            "Test Title",
            "Test Body"
        );

        expect(prisma.inAppNotification.create).toHaveBeenCalledWith({
            data: {
                userId: "user-1",
                type: "PAYMENT_REMINDER",
                title: "Test Title",
                body: "Test Body",
                url: undefined,
            },
        });
    });

    it("stores navigation URL", async () => {
        vi.mocked(prisma.inAppNotification.create).mockResolvedValue({
            id: "notif-1",
            userId: "user-1",
            type: "PAYMENT_REMINDER",
            title: "Test Title",
            body: "Test Body",
            url: "/tabs/123",
            read: false,
            createdAt: new Date(),
        });

        await createInAppNotification(
            "user-1",
            "PAYMENT_REMINDER",
            "Test Title",
            "Test Body",
            "/tabs/123"
        );

        expect(prisma.inAppNotification.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                url: "/tabs/123",
            }),
        });
    });

    it("defaults read to false", async () => {
        const mockResult = {
            id: "notif-1",
            userId: "user-1",
            type: "PAYMENT_REMINDER" as const,
            title: "Test Title",
            body: "Test Body",
            url: null,
            read: false,
            createdAt: new Date(),
        };
        vi.mocked(prisma.inAppNotification.create).mockResolvedValue(mockResult);

        const result = await createInAppNotification(
            "user-1",
            "PAYMENT_REMINDER",
            "Test Title",
            "Test Body"
        );

        // Verify result matches what the mock returns
        expect(result).toEqual(mockResult);

        // The create call doesn't explicitly set read - it uses DB default
        expect(prisma.inAppNotification.create).toHaveBeenCalledWith({
            data: expect.not.objectContaining({ read: expect.anything() }),
        });
    });
});
