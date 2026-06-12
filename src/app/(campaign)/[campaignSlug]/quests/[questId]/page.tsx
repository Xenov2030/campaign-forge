import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Pencil, Lock, Award, Eye, EyeOff, Package } from "lucide-react";
import type { QuestType, QuestStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  QUEST_TYPE_LABELS,
  QUEST_STATUS_LABELS,
  QUEST_TYPE_COLOR,
  sanitizeObjectives,
  sanitizeRewards,
} from "@/lib/quests";
import { QuestObjectives } from "@/components/campaign/quest-objectives";
import { QuestStatusSelect } from "@/components/campaign/quest-status-select";
import { QuestDangerZone } from "@/components/campaign/quest-danger-zone";

interface PageProps {
  params: Promise<{ campaignSlug: string; questId: string }>;
}

export default async function QuestDetailPage({ params }: PageProps) {
  const { campaignSlug, questId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: { campaign: { select: { id: true, masterId: true, slug: true } } },
  });
  if (!quest || quest.campaign.slug !== campaignSlug) notFound();

  const isMaster = quest.campaign.masterId === user.id;
  let isMember = isMaster;
  if (!isMaster) {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: quest.campaign.id, userId: user.id } },
    });
    isMember = !!member;
  }
  // Un jugador no miembro, o una misión oculta, no son accesibles.
  if (!isMaster && (!isMember || !quest.isKnownToParty)) notFound();

  const objectives = sanitizeObjectives(quest.objectives);
  const rewards = sanitizeRewards(quest.rewards);
  // Resolvemos el objeto-recompensa (si lo hay y sigue existiendo) para mostrar su nombre.
  const rewardItem = rewards.itemId
    ? await prisma.item.findUnique({ where: { id: rewards.itemId }, select: { id: true, name: true } })
    : null;
  const hasRewards = rewards.experience != null || rewards.gold !== "" || rewards.other !== "" || !!rewardItem;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${campaignSlug}/quests`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a Misiones
      </Link>

      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
        <div className="h-12 bg-gradient-to-r from-[#f59e0b]/20 to-[#f87171]/10" />
        <div className="px-6 pb-6 -mt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${QUEST_TYPE_COLOR[quest.type as QuestType]}`}>
                  {QUEST_TYPE_LABELS[quest.type as QuestType]}
                </span>
                {!isMaster && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                    {QUEST_STATUS_LABELS[quest.status as QuestStatus]}
                  </span>
                )}
                {isMaster && (
                  quest.isKnownToParty ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-900/20 text-green-400 border border-green-800/30">
                      <Eye className="h-3 w-3" /> Visible
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-800/40 text-[var(--text-muted)] border border-[var(--border-subtle)]">
                      <EyeOff className="h-3 w-3" /> Oculta
                    </span>
                  )
                )}
              </div>
              <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">{quest.name}</h1>
            </div>
            {isMaster && (
              <div className="flex items-center gap-2 shrink-0">
                <QuestStatusSelect questId={quest.id} initial={quest.status} />
                <Link
                  href={`/${campaignSlug}/quests/${questId}/edit`}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[var(--radius-md)] text-sm font-medium border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[#f59e0b] hover:text-[#f59e0b] transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Descripción */}
        {quest.description && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-3">Descripción</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{quest.description}</p>
          </div>
        )}

        {/* Gancho */}
        {quest.hook && (
          <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-[var(--radius-xl)] p-5">
            <p className="text-xs text-[#f59e0b] uppercase tracking-wider mb-2 font-semibold">El gancho</p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap italic">{quest.hook}</p>
          </div>
        )}

        {/* Objetivos (tildables) */}
        <QuestObjectives questId={quest.id} initial={objectives} canEdit={isMaster || isMember} />

        {/* Recompensas */}
        {hasRewards && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-[#f59e0b]" />
              <h2 className="font-display text-base font-bold text-[var(--text-primary)]">Recompensas</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-[var(--text-secondary)]">
              {rewards.experience != null && <span className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">{rewards.experience} XP</span>}
              {rewards.gold && <span className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">{rewards.gold}</span>}
              {rewards.other && <span className="px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">{rewards.other}</span>}
              {rewardItem && (
                <Link href={`/${campaignSlug}/items/${rewardItem.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/15 transition-colors">
                  <Package className="h-3.5 w-3.5" /> {rewardItem.name}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Notas del máster */}
        {isMaster && quest.notes && (
          <div className="bg-[var(--bg-surface)] border border-amber-700/30 rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-amber-400" />
              <h2 className="font-display text-base font-bold text-amber-400">Notas del máster</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{quest.notes}</p>
          </div>
        )}

        {/* Tags */}
        {quest.tags.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {quest.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {isMaster && <QuestDangerZone slug={campaignSlug} questId={quest.id} questName={quest.name} />}
    </div>
  );
}
