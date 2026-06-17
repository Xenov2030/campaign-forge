import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { MonstersList } from "@/components/campaign/monsters-list";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Bestiario — ${campaign?.name ?? ""}` };
}

export default async function MonstersPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true, members: { select: { userId: true } } },
  });
  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const isMember = isMaster || campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) redirect("/dashboard");

  const monsters = await prisma.monster.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, type: true, size: true, alignment: true,
      challengeRating: true, hitPoints: true, armorClass: true,
      tags: true, imageUrl: true,
    },
  });

  return (
    <MonstersList
      monsters={monsters}
      campaignSlug={campaignSlug}
      isMaster={isMaster}
      campaignId={campaign.id}
    />
  );
}
