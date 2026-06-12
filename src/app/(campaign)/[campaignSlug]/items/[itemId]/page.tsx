import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Package, Pencil, Sparkles, Link2, Eye, EyeOff, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ItemRarity } from "@prisma/client";
import { ITEM_RARITY_LABELS, ITEM_RARITY_COLOR, MISSION_REWARD_TAG } from "@/lib/items";
import { ItemDangerZone } from "@/components/campaign/item-danger-zone";
import { AssignToInventory } from "@/components/campaign/assign-to-inventory";

interface PageProps {
  params: Promise<{ campaignSlug: string; itemId: string }>;
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { campaignSlug, itemId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });
  if (!item || item.campaign.slug !== campaignSlug) notFound();

  const isMaster = item.campaign.masterId === user.id;
  if (!isMaster) {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: item.campaignId, userId: user.id } },
    });
    if (!member || !item.isKnownToParty) notFound();
  }

  const isMissionReward = item.tags.includes(MISSION_REWARD_TAG);
  const visibleTags = item.tags.filter((t: string) => t !== MISSION_REWARD_TAG);

  const characters = isMaster
    ? await prisma.character.findMany({
        where: { campaignId: item.campaignId, isNPC: false },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/${campaignSlug}/items`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Volver a Objetos
        </Link>
        {isMaster && (
          <Link
            href={`/${campaignSlug}/items/${itemId}/edit`}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="h-28 w-28 shrink-0 rounded-[var(--radius-lg)] overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="h-10 w-10 text-[var(--text-muted)] opacity-50" />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)] mb-2">{item.name}</h1>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${ITEM_RARITY_COLOR[item.rarity as ItemRarity]}`}>
                {ITEM_RARITY_LABELS[item.rarity as ItemRarity]}
              </span>
              {item.type && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">{item.type}</span>
              )}
              {item.isArtifact && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30"><Sparkles className="h-3 w-3" /> Artefacto</span>
              )}
              {item.requiresAttunement && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--accent-arcane)]/15 text-[var(--accent-arcane)] border border-[var(--accent-arcane)]/30"><Link2 className="h-3 w-3" /> Sintonización</span>
              )}
              {isMaster && isMissionReward && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border border-[var(--accent-gold)]/30"><Award className="h-3 w-3" /> Recompensa de misión</span>
              )}
              {isMaster && (
                item.isKnownToParty ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-400 border border-green-800/30"><Eye className="h-3 w-3" /> Visible</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800/40 text-[var(--text-muted)] border border-[var(--border-subtle)]"><EyeOff className="h-3 w-3" /> Oculto</span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {item.description && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-3">Descripción</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </div>
        )}
        {item.lore && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-3">Historia</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{item.lore}</p>
          </div>
        )}
        {visibleTags.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {isMaster && (
        <AssignToInventory itemId={item.id} itemName={item.name} characters={characters} />
      )}

      {isMaster && <ItemDangerZone slug={campaignSlug} itemId={item.id} itemName={item.name} />}
    </div>
  );
}
