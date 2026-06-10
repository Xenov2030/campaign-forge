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

  // Los jugadores solo reciben los NPCs conocidos (filtro en la query, no en memoria);
  // notas del máster y campos sensibles ni siquiera salen de la DB gracias al select.
  const npcs = await prisma.nPC.findMany({
    where: { campaignId: campaign.id, ...(isMaster ? {} : { isKnownToParty: true }) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, nickname: true, portraitUrl: true, race: true, occupation: true,
      personality: true, tags: true, isAlive: true, isKnownToParty: true, hitPoints: true, maxHitPoints: true,
    },
  });

  type NpcRow = (typeof npcs)[number];
  const cards: NpcCardData[] = npcs.map((n: NpcRow) => ({
    ...n,
    hitPoints: isMaster ? n.hitPoints : null,
    maxHitPoints: isMaster ? n.maxHitPoints : null,
  }));

  return <NpcsList npcs={cards} campaignSlug={campaignSlug} isMaster={isMaster} campaignId={campaign.id} />;
}
