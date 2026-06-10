import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { QuestsList } from "./quests-list";
import type { QuestCardData } from "./quest-card";
import { sanitizeObjectives } from "@/lib/quests";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Misiones — ${campaign?.name}` };
}

export default async function QuestsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });
  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  // Los jugadores solo ven las misiones visibles (filtro en la query); las notas del máster
  // y otros campos no necesarios para la card no salen de la DB gracias al select.
  const quests = await prisma.quest.findMany({
    where: { campaignId: campaign.id, ...(isMaster ? {} : { isKnownToParty: true }) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, type: true, status: true, description: true,
      isKnownToParty: true, objectives: true, tags: true,
    },
  });

  type QuestRow = (typeof quests)[number];
  const cards: QuestCardData[] = quests.map((q: QuestRow) => ({
    id: q.id,
    name: q.name,
    type: q.type,
    status: q.status,
    description: q.description,
    isKnownToParty: q.isKnownToParty,
    objectives: sanitizeObjectives(q.objectives),
    tags: q.tags,
  }));

  return <QuestsList quests={cards} campaignSlug={campaignSlug} isMaster={isMaster} />;
}
