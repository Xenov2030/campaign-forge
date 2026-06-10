"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users, Sparkles, Eye, EyeOff, Layers } from "lucide-react";
import { NpcCard, type NpcCardData } from "./npc-card";

type Filter = "all" | "visible" | "hidden";

const FILTERS: { id: Filter; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "Todos", icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "visible", label: "Visibles", icon: <Eye className="h-3.5 w-3.5" /> },
  { id: "hidden", label: "Ocultos", icon: <EyeOff className="h-3.5 w-3.5" /> },
];

export function NpcsList({
  npcs,
  campaignSlug,
  isMaster,
}: {
  npcs: NpcCardData[];
  campaignSlug: string;
  isMaster: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown =
    isMaster && filter !== "all"
      ? npcs.filter((n) => (filter === "visible" ? n.isKnownToParty : !n.isKnownToParty))
      : npcs;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-[#34d399]" />
              <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">NPCs</h1>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{npcs.length} personajes no jugadores</p>
          </div>

          {/* Filtro de visibilidad (solo máster) */}
          {isMaster && npcs.length > 0 && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${
                    filter === f.id
                      ? "bg-[#34d399]/15 text-[#34d399]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isMaster && (
          <div className="flex gap-2">
            <Link
              href={`/${campaignSlug}/ai-forge`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm border border-[var(--accent-arcane)]/30 bg-[var(--accent-arcane)]/10 text-[var(--accent-arcane)] hover:bg-[var(--accent-arcane)]/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generar con IA
            </Link>
            <Link
              href={`/${campaignSlug}/npcs/new`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo NPC
            </Link>
          </div>
        )}
      </div>

      {npcs.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#34d399]/10 border border-[#34d399]/20 mb-6">
            <Users className="h-10 w-10 text-[#34d399]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            {isMaster ? "Sin NPCs todavía" : "Aún no conoces a ningún NPC clave"}
          </h3>
          {isMaster && (
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
              Crea los personajes que poblarán tu mundo. Usa la IA para generarlos automáticamente.
            </p>
          )}
          {isMaster && (
            <div className="flex gap-3 justify-center">
              <Link
                href={`/${campaignSlug}/ai-forge`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] text-sm bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 text-[var(--accent-arcane)]"
              >
                <Sparkles className="h-4 w-4" />
                Generar con IA
              </Link>
              <Link
                href={`/${campaignSlug}/npcs/new`}
                className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
              >
                <Plus className="h-4 w-4" />
                Crear manualmente
              </Link>
            </div>
          )}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-16">
          No hay NPCs {filter === "visible" ? "visibles para el grupo" : "ocultos"}.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((npc) => (
            <NpcCard key={npc.id} npc={npc} campaignSlug={campaignSlug} isMaster={isMaster} />
          ))}
        </div>
      )}
    </div>
  );
}
