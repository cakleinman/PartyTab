import { prisma } from "@/lib/db/prisma";
import { Metadata } from "next";

type Props = {
  params: Promise<{ token: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { tab: true },
  });

  if (!invite || invite.revokedAt) {
    return {
      title: "PartyTab",
      description: "Track shared expenses, settle later.",
    };
  }

  const tabName = invite.tab.name;
  const isClosed = invite.tab.status === "CLOSED";

  return {
    title: isClosed ? `Settle up - ${tabName}` : `Join ${tabName}`,
    description: isClosed
      ? `Time to settle your tab for ${tabName}! Enter your name and PIN to view what you owe.`
      : `You're invited to join ${tabName} on PartyTab. Track shared expenses together.`,
    openGraph: {
      title: isClosed ? `Settle up - ${tabName}` : `Join ${tabName} on PartyTab`,
      description: isClosed
        ? `Time to settle your tab for ${tabName}!`
        : `You're invited to split expenses for ${tabName}.`,
      siteName: "PartyTab",
    },
  };
}

export default function JoinLayout({ children }: Props) {
  return children;
}
