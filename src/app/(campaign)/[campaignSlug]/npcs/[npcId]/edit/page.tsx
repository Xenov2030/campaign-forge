import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Users } from "lucide-react";
import { NpcForm, type NpcFormValues } from "@/components/campaign/npc-form";

interface PageProps {
  params: Promise<{ campaignSlug: string; npcId: string }>;
}

export default async function EditNPCPage({ params }: PageProps) {
  const { campaignSlug, npcId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const npc = await prisma.nPC.findUnique({
    where: { id: npcId },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });

  if (!npc || npc.campaign.slug !== campaignSlug) notFound();
  // Solo el máster edita NPCs.
  if (npc.campaign.masterId !== user.id) redirect(`/${campaignSlug}/npcs/${npcId}`);

  const initial: NpcFormValues = {
    name: npc.name,
    nickname: npc.nickname ?? "",
    race: npc.race ?? "",
    occupation: npc.occupation ?? "",
    age: npc.age ?? "",
    gender: npc.gender ?? "",
    appearance: npc.appearance ?? "",
    personality: npc.personality ?? "",
    backstory: npc.backstory ?? "",
    motivations: npc.motivations ?? "",
    secrets: npc.secrets ?? "",
    quirks: npc.quirks ?? "",
    voiceNotes: npc.voiceNotes ?? "",
    location: npc.location ?? "",
    faction: npc.faction ?? "",
    isKnownToParty: npc.isKnownToParty,
    isAlive: npc.isAlive,
    hitPoints: npc.hitPoints,
    maxHitPoints: npc.maxHitPoints,
    portraitUrl: npc.portraitUrl ?? "",
    tags: npc.tags,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${campaignSlug}/npcs/${npcId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al NPC
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#34d399]/10 border border-[#34d399]/30 flex items-center justify-center">
          <Users className="h-5 w-5 text-[#34d399]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Editar NPC</h1>
          <p className="text-sm text-[var(--text-muted)]">{npc.name}</p>
        </div>
      </div>

      <NpcForm slug={campaignSlug} mode="edit" npcId={npcId} initial={initial} />
    </div>
  );
}
