import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Plus, Sword, Heart, Shield, Zap } from "lucide-react";
import { formatModifier } from "@/lib/utils";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Personajes — ${campaign?.name}` };
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
    include: {
      user: { select: { displayName: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  type CharType = (typeof characters)[0];
  const myCharacters = characters.filter((c: CharType) => c.userId === user.id);
  const otherCharacters = characters.filter((c: CharType) => c.userId !== user.id);

  const canCreateCharacter = !isMaster && myCharacters.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sword className="h-5 w-5 text-[#60a5fa]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Personajes</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{characters.length} aventureros en la campaña</p>
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
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            Sin personajes todavía
          </h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
            {isMaster
              ? "Los jugadores aún no han creado sus personajes."
              : "Crea tu personaje para comenzar la aventura."}
          </p>
          {!isMaster && (
            <Link
              href={`/${campaignSlug}/characters/new`}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
            >
              <Plus className="h-4 w-4" />
              Crear mi personaje
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {myCharacters.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Mi personaje
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myCharacters.map((char: CharType) => (
                  <CharacterCard key={char.id} character={char} campaignSlug={campaignSlug} isOwn />
                ))}
              </div>
            </div>
          )}

          {otherCharacters.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
                {isMaster ? "Todos los personajes" : "Compañeros de aventura"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {otherCharacters.map((char: CharType) => (
                  <CharacterCard key={char.id} character={char} campaignSlug={campaignSlug} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type CharacterWithUser = Awaited<ReturnType<typeof prisma.character.findMany>>[0] & {
  user: { displayName: string; avatarUrl: string | null };
};

function CharacterCard({
  character,
  campaignSlug,
  isOwn,
}: {
  character: CharacterWithUser;
  campaignSlug: string;
  isOwn?: boolean;
}) {
  const stats = character.stats as Record<string, number> | null;
  const hpPercent = character.maxHitPoints > 0
    ? Math.round((character.hitPoints / character.maxHitPoints) * 100)
    : 100;

  const hpColor = hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171";

  return (
    <Link
      href={`/${campaignSlug}/characters/${character.id}`}
      className="group block bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden hover:border-[var(--border-default)] campaign-card transition-all"
    >
      {/* Header */}
      <div className="h-20 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-overlay)] flex items-center p-4 relative">
        {character.portraitUrl ? (
          <img
            src={character.portraitUrl}
            alt={character.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-[#60a5fa]/30 shrink-0"
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-[#60a5fa]/10 border-2 border-[#60a5fa]/20 flex items-center justify-center shrink-0">
            <span className="font-display text-xl font-bold text-[#60a5fa]/60">
              {character.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div className="ml-3 min-w-0">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] group-hover:text-[#60a5fa] transition-colors truncate">
            {character.name}
          </h3>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {[character.race, character.class].filter(Boolean).join(" · ")}
            {character.level > 1 && ` · Nv. ${character.level}`}
          </p>
        </div>
        {isOwn && (
          <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/20">
            Tuyo
          </div>
        )}
        {!character.isAlive && (
          <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
            Muerto
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* HP bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-[var(--text-muted)]">
              <Heart className="h-3 w-3" />
              Puntos de golpe
            </span>
            <span style={{ color: hpColor }}>{character.hitPoints}/{character.maxHitPoints}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${hpPercent}%`, background: hpColor }}
            />
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]">
            <Shield className="h-3 w-3 mx-auto mb-1 text-[var(--text-muted)]" />
            <p className="font-bold text-sm text-[var(--text-primary)]">{character.armorClass}</p>
            <p className="text-xs text-[var(--text-muted)]">CA</p>
          </div>
          <div className="text-center p-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]">
            <Zap className="h-3 w-3 mx-auto mb-1 text-[var(--text-muted)]" />
            <p className="font-bold text-sm text-[var(--text-primary)]">
              {character.initiative >= 0 ? `+${character.initiative}` : character.initiative}
            </p>
            <p className="text-xs text-[var(--text-muted)]">Ini</p>
          </div>
          <div className="text-center p-2 rounded-[var(--radius-sm)] bg-[var(--bg-elevated)]">
            <span className="text-xs text-[var(--text-muted)] block mb-1">Nv</span>
            <p className="font-bold text-sm text-[var(--text-primary)]">{character.level}</p>
          </div>
        </div>

        {/* Conditions */}
        {Array.isArray(character.conditions) && character.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(character.conditions as string[]).map((cond) => (
              <span key={cond} className="text-xs px-1.5 py-0.5 rounded bg-red-900/20 text-red-400 border border-red-800/30">
                {cond}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
          <span>{character.user.displayName}</span>
          {character.background && <span>{character.background}</span>}
        </div>
      </div>
    </Link>
  );
}
