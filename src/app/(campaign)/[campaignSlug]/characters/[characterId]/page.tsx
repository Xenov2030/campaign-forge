import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Heart, Shield, Zap, Star, User } from "lucide-react";
import { formatModifier } from "@/lib/utils";

interface PageProps {
  params: Promise<{ campaignSlug: string; characterId: string }>;
}

function StatBlock({ label, value }: { label: string; value: number }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center gap-1 bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-subtle)]">
      <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
      <p className="font-display text-3xl font-black text-[var(--text-primary)]">{value}</p>
      <p className={`text-sm font-bold px-2 py-0.5 rounded ${mod >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
        {formatModifier(mod)}
      </p>
    </div>
  );
}

export default async function CharacterDetailPage({ params }: PageProps) {
  const { campaignSlug, characterId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    include: {
      campaign: { select: { id: true, name: true, masterId: true, slug: true } },
      user: { select: { displayName: true, avatarUrl: true } },
    },
  });

  if (!character || character.campaign.slug !== campaignSlug) notFound();

  const isMaster = character.campaign.masterId === user.id;
  const isOwner = character.userId === user.id;
  if (!isMaster && !isOwner) redirect(`/${campaignSlug}`);

  const stats = character.stats as Record<string, number>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <Link href={`/${campaignSlug}/characters`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" />
        Volver a personajes
      </Link>

      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
        <div className="h-24 bg-gradient-to-r from-[#60a5fa]/20 to-[#a855f7]/20" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-12 mb-4">
            <div className="h-24 w-24 rounded-[var(--radius-xl)] border-4 border-[var(--bg-surface)] overflow-hidden bg-[var(--bg-elevated)] shrink-0">
              {character.portraitUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={character.portraitUrl} alt={character.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-10 w-10 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <h1 className="font-display text-3xl font-black text-[var(--text-primary)] truncate">{character.name}</h1>
              <p className="text-[var(--text-secondary)] text-sm">
                {[character.race, character.class, character.subclass].filter(Boolean).join(" · ")}
                {character.level ? ` · Nivel ${character.level}` : ""}
              </p>
            </div>
            <div className="pb-1 text-right shrink-0">
              <p className="text-xs text-[var(--text-muted)]">Jugador</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{character.user.displayName}</p>
            </div>
          </div>

          {/* Core stats row */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-800/30 rounded-[var(--radius-md)]">
              <Heart className="h-4 w-4 text-red-400" />
              <div>
                <p className="text-xs text-red-400/70">Puntos de Golpe</p>
                <p className="text-lg font-bold text-red-400">{character.hitPoints}<span className="text-sm font-normal text-red-400/70">/{character.maxHitPoints}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/20 border border-blue-800/30 rounded-[var(--radius-md)]">
              <Shield className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-xs text-blue-400/70">Clase de Armadura</p>
                <p className="text-lg font-bold text-blue-400">{character.armorClass}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-900/20 border border-yellow-800/30 rounded-[var(--radius-md)]">
              <Zap className="h-4 w-4 text-yellow-400" />
              <div>
                <p className="text-xs text-yellow-400/70">Velocidad</p>
                <p className="text-lg font-bold text-yellow-400">{character.speed} ft</p>
              </div>
            </div>
            {character.background && (
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 border border-purple-800/30 rounded-[var(--radius-md)]">
                <Star className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="text-xs text-purple-400/70">Trasfondo</p>
                  <p className="text-sm font-bold text-purple-400">{character.background}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Atributos */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-6">
        <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">Atributos</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {["STR","DEX","CON","INT","WIS","CHA"].map((stat) => (
            <StatBlock key={stat} label={stat} value={stats[stat] ?? 10} />
          ))}
        </div>
      </div>

      {/* Descripción */}
      {(character.appearance || character.backstory) && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">Historia</h2>
          {character.appearance && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Apariencia</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{character.appearance}</p>
            </div>
          )}
          {character.backstory && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Trasfondo</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{character.backstory}</p>
            </div>
          )}
        </div>
      )}

      {/* Info extra */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        {character.alignment && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Alineamiento</p>
            <p className="text-[var(--text-primary)] font-medium">{character.alignment}</p>
          </div>
        )}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Estado</p>
          <p className={`font-medium ${character.isAlive ? "text-green-400" : "text-red-400"}`}>
            {character.isAlive ? "Vivo" : "Muerto"}
          </p>
        </div>
      </div>
    </div>
  );
}
