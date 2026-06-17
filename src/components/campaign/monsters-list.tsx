"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Skull, Sparkles, Layers, Swords, Leaf, Crosshair } from "lucide-react";
import { MonsterCard, type MonsterCardData } from "@/app/(campaign)/[campaignSlug]/monsters/monster-card";
import { MonsterVaultPicker } from "@/app/(campaign)/[campaignSlug]/monsters/monster-vault-picker";

type DispositionFilter = "all" | "amigable" | "neutral" | "hostil";

const DISP_FILTERS: { id: DispositionFilter; label: string; icon: React.ReactNode }[] = [
  { id: "all",      label: "Todas",    icon: <Layers className="h-3.5 w-3.5" /> },
  { id: "amigable", label: "Amigables", icon: <Leaf className="h-3.5 w-3.5" /> },
  { id: "neutral",  label: "Neutrales", icon: <Crosshair className="h-3.5 w-3.5" /> },
  { id: "hostil",   label: "Hostiles",  icon: <Swords className="h-3.5 w-3.5" /> },
];

const HOSTILE_TAGS = ["hostil", "legendario", "jefe"];

interface Props {
  monsters: MonsterCardData[];
  campaignSlug: string;
  isMaster: boolean;
  campaignId: string;
}

export function MonstersList({ monsters, campaignSlug, isMaster, campaignId }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DispositionFilter>("all");

  const filtered = monsters.filter((m) => {
    const matchesSearch = query === "" || m.name.toLowerCase().includes(query.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "all") return true;
    if (filter === "amigable") return m.tags.includes("amigable") || m.tags.includes("aliado");
    if (filter === "neutral") return m.tags.includes("neutral") || (!m.tags.some((t) => ["amigable", "aliado", ...HOSTILE_TAGS].includes(t)));
    if (filter === "hostil") return m.tags.some((t) => HOSTILE_TAGS.includes(t));
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Skull className="h-5 w-5 text-[var(--accent-gold)]" />
              <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Bestiario</h1>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{monsters.length} criatura{monsters.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Filtros de disposición */}
          {monsters.length > 0 && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              {DISP_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${
                    filter === f.id
                      ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]"
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
          <div className="flex gap-2 flex-wrap">
            <MonsterVaultPicker campaignId={campaignId} />
            <Link
              href={`/${campaignSlug}/ai-forge`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm border border-[var(--accent-arcane)]/30 bg-[var(--accent-arcane)]/10 text-[var(--accent-arcane)] hover:bg-[var(--accent-arcane)]/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Crear con IA
            </Link>
            <Link
              href={`/${campaignSlug}/monsters/new`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all shadow-[var(--glow-gold)] text-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva criatura
            </Link>
          </div>
        )}
      </div>

      {/* Buscador — solo con 10+ criaturas */}
      {monsters.length >= 10 && (
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar criatura..."
            className="w-full pl-9 pr-4 h-10 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
          />
        </div>
      )}

      {/* Estado vacío */}
      {monsters.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 mb-6">
            <Skull className="h-10 w-10 text-[var(--accent-gold)]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            {isMaster ? "Sin criaturas todavía" : "El bestiario está vacío"}
          </h3>
          {isMaster && (
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
              Creá los monstruos y criaturas de tu campaña. Usá la IA para generarlos automáticamente.
            </p>
          )}
          {isMaster && (
            <div className="flex gap-3 justify-center flex-wrap">
              <MonsterVaultPicker campaignId={campaignId} />
              <Link
                href={`/${campaignSlug}/ai-forge`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] text-sm bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 text-[var(--accent-arcane)]"
              >
                <Sparkles className="h-4 w-4" />
                Crear con IA
              </Link>
              <Link
                href={`/${campaignSlug}/monsters/new`}
                className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
              >
                <Plus className="h-4 w-4" />
                Crear manualmente
              </Link>
            </div>
          )}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-16">
          {query ? `Sin resultados para «${query}»` : `No hay criaturas ${filter !== "all" ? DISP_FILTERS.find((f) => f.id === filter)?.label.toLowerCase() : ""}.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <MonsterCard key={m.id} monster={m} campaignSlug={campaignSlug} isMaster={isMaster} />
          ))}
        </div>
      )}
    </div>
  );
}
