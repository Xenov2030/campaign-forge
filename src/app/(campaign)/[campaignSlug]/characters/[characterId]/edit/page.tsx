import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Sword } from "lucide-react";
import { CharacterForm } from "@/components/campaign/character-form";
import { CharacterDangerZone } from "@/components/campaign/character-danger-zone";

interface PageProps {
  params: Promise<{ campaignSlug: string; characterId: string }>;
}

export default async function EditCharacterPage({ params }: PageProps) {
  const { campaignSlug, characterId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      campaign: { select: { id: true, name: true, masterId: true, slug: true } },
    },
  });

  if (!character || character.campaign.slug !== campaignSlug) notFound();

  const isMaster = character.campaign.masterId === user.id;
  const isOwner = character.userId === user.id;
  if (!isMaster && !isOwner) redirect(`/${campaignSlug}`);

  const stats = (character.stats ?? {}) as Record<string, number>;
  const stat = (key: string): number => (typeof stats[key] === "number" ? stats[key] : 10);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <Link href={`/${campaignSlug}/characters/${characterId}`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver al personaje
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[#60a5fa]/10 border border-[#60a5fa]/30 flex items-center justify-center">
          <Sword className="h-5 w-5 text-[#60a5fa]" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-[var(--text-primary)]">Editar personaje</h1>
          <p className="text-sm text-[var(--text-muted)]">Actualiza los datos de tu aventurero</p>
        </div>
      </div>

      <CharacterForm
        slug={campaignSlug}
        mode="edit"
        characterId={characterId}
        campaignId={character.campaignId}
        initial={{
          name: character.name,
          race: character.race ?? "",
          className: character.class ?? "",
          subclass: character.subclass ?? "",
          level: character.level,
          background: character.background ?? "",
          alignment: character.alignment ?? "",
          appearance: character.appearance ?? "",
          backstory: character.backstory ?? "",
          ideals: character.ideals ?? "",
          portraitUrl: character.portraitUrl ?? "",
          bannerUrl: character.bannerUrl ?? "",
          str: stat("STR"),
          dex: stat("DEX"),
          con: stat("CON"),
          int: stat("INT"),
          wis: stat("WIS"),
          cha: stat("CHA"),
          hitPoints: character.maxHitPoints,
          armorClass: character.armorClass,
          speed: character.speed,
        }}
      />

      <CharacterDangerZone
        slug={campaignSlug}
        characterId={characterId}
        campaignId={character.campaignId}
        targetUserId={character.userId}
        mode={isMaster && !isOwner ? "kick" : "deleteCharacter"}
        characterName={character.name}
      />
    </div>
  );
}
