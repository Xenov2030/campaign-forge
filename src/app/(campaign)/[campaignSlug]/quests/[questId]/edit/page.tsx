import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Target } from "lucide-react";
import { QuestForm, type QuestFormValues } from "@/components/campaign/quest-form";
import { sanitizeObjectives, sanitizeRewards } from "@/lib/quests";

interface PageProps {
  params: Promise<{ campaignSlug: string; questId: string }>;
}

export default async function EditQuestPage({ params }: PageProps) {
  const { campaignSlug, questId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const quest = await prisma.quest.findUnique({
    where: { id: questId },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });

  if (!quest || quest.campaign.slug !== campaignSlug) notFound();
  if (quest.campaign.masterId !== user.id) redirect(`/${campaignSlug}/quests/${questId}`);

  const initial: QuestFormValues = {
    name: quest.name,
    type: quest.type,
    status: quest.status,
    description: quest.description ?? "",
    hook: quest.hook ?? "",
    notes: quest.notes ?? "",
    isKnownToParty: quest.isKnownToParty,
    deadline: quest.deadline ? quest.deadline.toISOString().split("T")[0] : "",
    objectives: sanitizeObjectives(quest.objectives),
    rewards: sanitizeRewards(quest.rewards),
    tags: quest.tags,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${campaignSlug}/quests/${questId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a la misión
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#f59e0b]/10 border border-[#f59e0b]/30 flex items-center justify-center">
          <Target className="h-5 w-5 text-[#f59e0b]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Editar misión</h1>
          <p className="text-sm text-[var(--text-muted)]">{quest.name}</p>
        </div>
      </div>

      <QuestForm slug={campaignSlug} mode="edit" questId={questId} campaignId={quest.campaignId} initial={initial} />
    </div>
  );
}
