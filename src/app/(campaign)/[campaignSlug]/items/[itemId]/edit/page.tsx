import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Package } from "lucide-react";
import { ItemForm, type ItemFormValues } from "@/components/campaign/item-form";
import { MISSION_REWARD_TAG } from "@/lib/items";

interface PageProps {
  params: Promise<{ campaignSlug: string; itemId: string }>;
}

export default async function EditItemPage({ params }: PageProps) {
  const { campaignSlug, itemId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });
  if (!item || item.campaign.slug !== campaignSlug) notFound();
  if (item.campaign.masterId !== user.id) redirect(`/${campaignSlug}/items/${itemId}`);

  const initial: ItemFormValues = {
    name: item.name,
    type: item.type ?? "",
    rarity: item.rarity,
    description: item.description ?? "",
    lore: item.lore ?? "",
    isArtifact: item.isArtifact,
    requiresAttunement: item.requiresAttunement,
    isKnownToParty: item.isKnownToParty,
    missionReward: item.tags.includes(MISSION_REWARD_TAG),
    imageUrl: item.imageUrl ?? "",
    tags: item.tags.filter((t: string) => t !== MISSION_REWARD_TAG),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${campaignSlug}/items/${itemId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al objeto
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center">
          <Package className="h-5 w-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Editar objeto</h1>
          <p className="text-sm text-[var(--text-muted)]">{item.name}</p>
        </div>
      </div>

      <ItemForm slug={campaignSlug} mode="edit" itemId={itemId} initial={initial} />
    </div>
  );
}
