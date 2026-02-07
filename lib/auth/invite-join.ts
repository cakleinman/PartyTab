import { prisma } from "@/lib/db/prisma";
import { throwApiError } from "@/lib/api/errors";
import { generatePin, hashPin } from "@/lib/auth/pin";
import { setSessionUserId } from "@/lib/session/session";
import { parseDisplayName } from "@/lib/validators/schemas";

type TabStatus = "ACTIVE" | "CLOSED";

interface User {
    id: string;
    displayName: string;
}

interface ResolveUserParams {
    sessionUserId: string | null;
    displayName: string | undefined;
    pin: string | undefined;
    tabStatus: TabStatus;
}

interface ResolveUserResult {
    user: User;
    generatedPin?: string;
}

/**
 * Resolves the user for an invite join request.
 *
 * Handles three scenarios:
 * 1. Session user exists → return that user
 * 2. Active tab, no session → create/find user with generated PIN
 * 3. Closed tab, no session → require PIN for re-authentication
 */
export async function resolveUserForInvite({
    sessionUserId,
    displayName: rawDisplayName,
    pin,
    tabStatus,
}: ResolveUserParams): Promise<ResolveUserResult> {
    // Scenario 1: Existing session
    if (sessionUserId) {
        const user = await prisma.user.findUnique({ where: { id: sessionUserId } });
        if (!user) {
            throwApiError(401, "unauthorized", "Session expired");
        }
        return { user: { id: user.id, displayName: user.displayName } };
    }

    // No session - need display name
    const displayName = parseDisplayName(rawDisplayName);

    // Scenario 3: Closed tab requires PIN re-authentication
    if (tabStatus === "CLOSED") {
        if (!pin) {
            throwApiError(400, "validation_error", "PIN is required for closed tabs");
        }
        const pinHash = await hashPin(String(pin));
        const user = await prisma.user.findFirst({
            where: { displayName, pinHash },
        });
        if (!user) {
            throwApiError(401, "unauthorized", "Invalid name or PIN");
        }
        await setSessionUserId(user.id);
        return { user: { id: user.id, displayName: user.displayName } };
    }

    // Scenario 2: Active tab - generate PIN for new user
    const generatedPin = generatePin();
    const pinHash = await hashPin(generatedPin);

    // Check for existing user (unlikely with random PIN, but handle anyway)
    const existingUser = await prisma.user.findFirst({
        where: { displayName, pinHash },
    });

    const user = existingUser ?? await prisma.user.create({
        data: { displayName, pinHash },
    });

    await setSessionUserId(user.id);
    return {
        user: { id: user.id, displayName: user.displayName },
        generatedPin,
    };
}

interface JoinTabParams {
    tabId: string;
    userId: string;
    tabStatus: TabStatus;
}

interface JoinTabResult {
    isNewParticipant: boolean;
    redirectToSettlement: boolean;
}

/**
 * Handles adding a user as a participant to a tab.
 *
 * For closed tabs, only existing participants can re-authenticate.
 * For active tabs, new participants are created.
 */
export async function joinTabAsParticipant({
    tabId,
    userId,
    tabStatus,
}: JoinTabParams): Promise<JoinTabResult> {
    const existing = await prisma.participant.findUnique({
        where: { tabId_userId: { tabId, userId } },
    });

    // Closed tabs only allow existing participants
    if (tabStatus === "CLOSED") {
        if (!existing) {
            throwApiError(409, "tab_closed", "This tab is closed and not accepting new participants.");
        }
        return { isNewParticipant: false, redirectToSettlement: true };
    }

    // Active tab - create participant if new
    if (!existing) {
        await prisma.participant.create({
            data: { tabId, userId },
        });
        return { isNewParticipant: true, redirectToSettlement: false };
    }

    return { isNewParticipant: false, redirectToSettlement: false };
}
