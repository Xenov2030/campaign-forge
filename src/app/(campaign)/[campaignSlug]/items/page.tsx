import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { ItemsList } from "./items-list";
import type { ItemCardData } from "./item-card";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Objetos — ${campaign?.name}` };
}

export default async function ItemsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });
  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  // Los jugadores solo ven los objetos visibles (filtro en la query).
  const items: ItemCardData[] = await prisma.item.findMany({
    where: { campaignId: campaign.id, ...(isMaster ? {} : { isKnownToParty: true }) },
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, type: true, rarity: true, description: true,
      imageUrl: true, isArtifact: true, isKnownToParty: true,
    },
  });

  return <ItemsList items={items} campaignSlug={campaignSlug} campaignId={campaign.id} isMaster={isMaster} />;
}
