import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Plus, Sword } from "lucide-react";
import { CharacterCard, type CharacterCardData } from "./character-card";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Personajes — ${campaign?.name}` };
}

function toCardData(c: Record<string, unknown>): CharacterCardData {
  return {
    id: c.id as string,
    name: c.name as string,
    race: (c.race as string | null) ?? null,
    class: (c.class as string | null) ?? null,
    level: (c.level as number) ?? 1,
    portraitUrl: (c.portraitUrl as string | null) ?? null,
    isAlive: c.isAlive !== false,
    hitPoints: (c.hitPoints as number) ?? 0,
    maxHitPoints: (c.maxHitPoints as number) ?? 0,
    stats: (c.stats as Record<string, number> | null) ?? null,
    armorClass: (c.armorClass as number) ?? 10,
    initiative: (c.initiative as number) ?? 0,
    speed: (c.speed as number) ?? 30,
    conditions: Array.isArray(c.conditions) ? (c.conditions as string[]) : [],
  };
}

export default async function CharactersPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  const characters = await prisma.character.findMany({
    where: { campaignId: campaign.id, isNPC: false },
    include: { user: { select: { displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });

  type CharType = (typeof characters)[0];
  const myCharacters = characters.filter((c: CharType) => c.userId === user.id);
  const otherCharacters = characters.filter((c: CharType) => c.userId !== user.id);

  // El jugador puede crear su único personaje; el master puede crear los que quiera.
  const canCreateCharacter = isMaster || myCharacters.length === 0;

  const grid = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4";

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sword className="h-5 w-5 text-[#60a5fa]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Personajes</h1>
          </div>
        </div>
        {canCreateCharacter && (
          <Link
            href={`/${campaignSlug}/characters/new`}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Crear personaje
          </Link>
        )}
      </div>

      {characters.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#60a5fa]/10 border border-[#60a5fa]/20 mb-6">
            <Sword className="h-10 w-10 text-[#60a5fa]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Sin personajes todavía</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            {isMaster ? "Los jugadores aún no han creado sus personajes." : "Crea tu personaje para comenzar la aventura."}
          </p>
          {canCreateCharacter && (
            <Link
              href={`/${campaignSlug}/characters/new`}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
            >
              <Plus className="h-4 w-4" />
              {isMaster ? "Crear personaje" : "Crear mi personaje"}
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {!isMaster ? (
            <div className={grid}>
              {myCharacters.map((c: CharType) => (
                <CharacterCard key={c.id} character={toCardData(c)} campaignSlug={campaignSlug} canEdit isOwn />
              ))}
              {otherCharacters.map((c: CharType) => (
                <CharacterCard key={c.id} character={toCardData(c)} campaignSlug={campaignSlug} canEdit={false} />
              ))}
            </div>
          ) : characters.length > 0 ? (
            <div>
              <div className={grid}>
                {characters.map((c: CharType) => (
                  <CharacterCard
                    key={c.id}
                    character={toCardData(c)}
                    campaignSlug={campaignSlug}
                    canEdit
                    isOwn={c.userId === user.id}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
