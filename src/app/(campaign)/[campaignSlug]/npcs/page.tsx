import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { NpcsList } from "./npcs-list";
import type { NpcCardData } from "./npc-card";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `NPCs — ${campaign?.name}` };
}

export default async function NPCsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  const npcs = await prisma.nPC.findMany({
    where: { campaignId: campaign.id },
    orderBy: { createdAt: "desc" },
  });

  type NpcRow = (typeof npcs)[number];
  // Los jugadores solo reciben los NPCs conocidos; la vida y notas del máster nunca salen al cliente.
  const visible = isMaster ? npcs : npcs.filter((n: NpcRow) => n.isKnownToParty);

  const cards: NpcCardData[] = visible.map((n: NpcRow) => ({
    id: n.id,
    name: n.name,
    portraitUrl: n.portraitUrl,
    race: n.race,
    occupation: n.occupation,
    personality: n.personality,
    tags: n.tags,
    isAlive: n.isAlive,
    isKnownToParty: n.isKnownToParty,
    hitPoints: isMaster ? n.hitPoints : null,
    maxHitPoints: isMaster ? n.maxHitPoints : null,
  }));

  return <NpcsList npcs={cards} campaignSlug={campaignSlug} isMaster={isMaster} campaignId={campaign.id} />;
}
