import { prisma } from "@/lib/db/prisma";

/**
 * Merge a guest user's data into a target user (Google/Email authenticated).
 * Transfers all participants, tabs, expenses, invites, and acknowledgements.
 * The guest user is kept for audit trail with linkedFromId pointing to the target.
 */
export async function mergeGuestToAccount(
  guestUserId: string,
  targetUserId: string
): Promise<void> {
  // Don't merge if same user
  if (guestUserId === targetUserId) return;

  // Verify both users exist
  const [guestUser, targetUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: guestUserId } }),
    prisma.user.findUnique({ where: { id: targetUserId } }),
  ]);

  if (!guestUser || !targetUser) {
    throw new Error("User not found for merge");
  }

  // Don't merge if guest is already linked
  if (guestUser.linkedFromId) {
    return;
  }

  // Perform all updates in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update all Participant records from guest to target
    // First, check for conflicts (same tab, both users are participants)
    const guestParticipants = await tx.participant.findMany({
      where: { userId: guestUserId },
    });

    for (const participant of guestParticipants) {
      // Check if target already has a participant in this tab
      const existingParticipant = await tx.participant.findUnique({
        where: {
          tabId_userId: {
            tabId: participant.tabId,
            userId: targetUserId,
          },
        },
      });

      if (existingParticipant) {
        // Both users are in same tab - update references from guest participant to target participant
        // Update expense splits
        await tx.expenseSplit.updateMany({
          where: { participantId: participant.id },
          data: { participantId: existingParticipant.id },
        });

        // Update expenses paid by
        await tx.expense.updateMany({
          where: { paidByParticipantId: participant.id },
          data: { paidByParticipantId: existingParticipant.id },
        });

        // Update settlement transfers from
        await tx.settlementTransfer.updateMany({
          where: { fromParticipantId: participant.id },
          data: { fromParticipantId: existingParticipant.id },
        });

        // Update settlement transfers to
        await tx.settlementTransfer.updateMany({
          where: { toParticipantId: participant.id },
          data: { toParticipantId: existingParticipant.id },
        });

        // Update acknowledgements from
        await tx.settlementAcknowledgement.updateMany({
          where: { fromParticipantId: participant.id },
          data: { fromParticipantId: existingParticipant.id },
        });

        // Update acknowledgements to
        await tx.settlementAcknowledgement.updateMany({
          where: { toParticipantId: participant.id },
          data: { toParticipantId: existingParticipant.id },
        });

        // Update receipt item claims
        await tx.receiptItemClaim.updateMany({
          where: { participantId: participant.id },
          data: { participantId: existingParticipant.id },
        });

        // Delete the duplicate guest participant
        await tx.participant.delete({ where: { id: participant.id } });
      } else {
        // No conflict - just update userId
        await tx.participant.update({
          where: { id: participant.id },
          data: { userId: targetUserId },
        });
      }
    }

    // 2. Update Tab.createdByUserId
    await tx.tab.updateMany({
      where: { createdByUserId: guestUserId },
      data: { createdByUserId: targetUserId },
    });

    // 3. Update Expense.createdByUserId
    await tx.expense.updateMany({
      where: { createdByUserId: guestUserId },
      data: { createdByUserId: targetUserId },
    });

    // 4. Update Invite.createdByUserId
    await tx.invite.updateMany({
      where: { createdByUserId: guestUserId },
      data: { createdByUserId: targetUserId },
    });

    // 5. Update SettlementAcknowledgement initiator
    await tx.settlementAcknowledgement.updateMany({
      where: { initiatedByUserId: guestUserId },
      data: { initiatedByUserId: targetUserId },
    });

    // 6. Update SettlementAcknowledgement acknowledger
    await tx.settlementAcknowledgement.updateMany({
      where: { acknowledgedByUserId: guestUserId },
      data: { acknowledgedByUserId: targetUserId },
    });

    // 7. Transfer claim tokens
    await tx.userClaimToken.updateMany({
      where: { userId: guestUserId },
      data: { userId: targetUserId },
    });

    // 8. Mark guest as linked to target (for audit trail)
    await tx.user.update({
      where: { id: guestUserId },
      data: {
        linkedFromId: targetUserId,
        // Clear auth credentials to prevent login
        pinHash: null,
      },
    });
  });
}
