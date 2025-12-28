import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";

type Props = {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  const claimToken = await prisma.userClaimToken.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          participants: {
            include: { tab: true },
          },
        },
      },
    },
  });

  if (!claimToken || claimToken.claimedAt) {
    return {
      title: "PartyTab",
      description: "Track shared expenses, settle later.",
    };
  }

  const displayName = claimToken.user.displayName;
  const tabs = claimToken.user.participants.map((p) => p.tab);
  const tabNames = tabs.map((t) => t.name).join(", ");

  return {
    title: `Claim your account - ${displayName}`,
    description: `${displayName}, you've been added to ${tabNames} on PartyTab. Claim your account to start tracking expenses.`,
    openGraph: {
      title: `${displayName}, join ${tabNames} on PartyTab`,
      description: `You've been added to a shared expense tab. Claim your account to get started.`,
      siteName: "PartyTab",
    },
  };
}

export default function ClaimLayout({ children }: Props) {
  return children;
}
