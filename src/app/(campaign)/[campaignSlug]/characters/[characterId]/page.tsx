import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Heart, Shield, Zap, Star, User, Pencil, Package } from "lucide-react";
import { formatModifier } from "@/lib/utils";
import { InventoryList } from "@/components/campaign/inventory-list";
import { PrintButton } from "@/components/campaign/print-button";

interface PageProps {
  params: Promise<{ campaignSlug: string; characterId: string }>;
}

function StatBlock({ label, value }: { label: string; value: number }) {
  const mod = Math.floor((value - 10) / 2);
  return (
    <div className="flex flex-col items-center gap-0.5 bg-[var(--bg-elevated)] rounded-[var(--radius-md)] p-2.5 border border-[var(--border-subtle)]">
      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{label}</p>
      <p className="font-display text-2xl font-black text-[var(--text-primary)]">{value}</p>
      <p className={`text-xs font-bold px-1.5 py-0.5 rounded ${mod >= 0 ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
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
      inventory: {
        select: { id: true, itemId: true, name: true, quantity: true, isEquipped: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!character || character.campaign.slug !== campaignSlug) notFound();

  const isMaster = character.campaign.masterId === user.id;
  const isOwner = character.userId === user.id;
  const canEdit = isMaster || isOwner;
  // Cualquier miembro de la campaña puede ver la ficha; editar solo el dueño o el máster.
  if (!canEdit) {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: character.campaign.id, userId: user.id } },
    });
    if (!member) redirect(`/${campaignSlug}`);
  }

  const stats = character.stats as Record<string, number>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href={`/${campaignSlug}/characters`} className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Volver a personajes
        </Link>
        <div className="flex items-center gap-2">
          <PrintButton />
          {canEdit && (
            <Link
              href={`/${campaignSlug}/characters/${characterId}/edit`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] overflow-hidden mb-6">
        <div
          className="h-32 bg-gradient-to-r from-[#60a5fa]/20 to-[#a855f7]/20 bg-cover bg-center"
          style={character.bannerUrl ? { backgroundImage: `url(${character.bannerUrl})` } : undefined}
        />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-14 mb-4">
            <div className="relative h-28 w-24 rounded-[var(--radius-xl)] border-4 border-[var(--bg-surface)] overflow-hidden bg-[var(--bg-elevated)] shrink-0">
              {character.portraitUrl ? (
                <Image src={character.portraitUrl} alt={character.name} fill className="object-cover object-top" />
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

          {/* Core stats row — celdas del mismo tamaño */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 px-4 py-3 bg-red-900/20 border border-red-800/30 rounded-[var(--radius-md)] min-w-0">
              <Heart className="h-4 w-4 text-red-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-red-400/70 truncate">Puntos de Golpe</p>
                <p className="text-lg font-bold text-red-400">{character.hitPoints}<span className="text-sm font-normal text-red-400/70">/{character.maxHitPoints}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-900/20 border border-blue-800/30 rounded-[var(--radius-md)] min-w-0">
              <Shield className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-blue-400/70 truncate">Clase de Armadura</p>
                <p className="text-lg font-bold text-blue-400">{character.armorClass}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-yellow-900/20 border border-yellow-800/30 rounded-[var(--radius-md)] min-w-0">
              <Zap className="h-4 w-4 text-yellow-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-yellow-400/70 truncate">Velocidad</p>
                <p className="text-lg font-bold text-yellow-400">{character.speed} ft</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 bg-purple-900/20 border border-purple-800/30 rounded-[var(--radius-md)] min-w-0">
              <Star className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-purple-400/70 truncate">Trasfondo</p>
                <p className="text-sm font-bold text-purple-400 truncate">{character.background || "—"}</p>
              </div>
            </div>
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
      {(character.backstory || character.ideals || character.appearance) && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)] mb-4">Historia</h2>
          {character.backstory && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Trasfondo</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{character.backstory}</p>
            </div>
          )}
          {character.ideals && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Ideales</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{character.ideals}</p>
            </div>
          )}
          {character.appearance && (
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Apariencia</p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{character.appearance}</p>
            </div>
          )}
        </div>
      )}

      {/* Inventario */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-4 w-4 text-[var(--accent-gold)]" />
          <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">Inventario</h2>
        </div>
        <InventoryList
          campaignSlug={campaignSlug}
          canManage={canEdit}
          items={character.inventory}
        />
      </div>

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
