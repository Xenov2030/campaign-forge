"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Package, Sparkles, Search } from "lucide-react";
import type { ItemRarity } from "@prisma/client";
import { ITEM_RARITIES, ITEM_RARITY_LABELS, ITEM_RARITY_COLOR } from "@/lib/items";
import { ItemCard, type ItemCardData } from "./item-card";

export function ItemsList({
  items,
  campaignSlug,
  isMaster,
}: {
  items: ItemCardData[];
  campaignSlug: string;
  isMaster: boolean;
}) {
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<"all" | ItemRarity>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Tipos presentes en el catálogo (filtro dinámico).
  const types = Array.from(new Set(items.map((i) => i.type).filter((t): t is string => !!t))).sort();

  const shown = items.filter((i) => {
    const nameOk = !search.trim() || i.name.toLowerCase().includes(search.toLowerCase());
    const rarityOk = rarityFilter === "all" || i.rarity === rarityFilter;
    const typeOk = typeFilter === "all" || i.type === typeFilter;
    return nameOk && rarityOk && typeOk;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-5 w-5 text-[var(--accent-gold)]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Objetos</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{items.length} objetos</p>
        </div>

        {isMaster && (
          <div className="flex gap-2 flex-wrap">
            <Link
              href={`/${campaignSlug}/ai-forge`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] text-sm border border-[var(--accent-arcane)]/30 bg-[var(--accent-arcane)]/10 text-[var(--accent-arcane)] hover:bg-[var(--accent-arcane)]/15 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generar con IA
            </Link>
            <Link
              href={`/${campaignSlug}/items/new`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo objeto
            </Link>
          </div>
        )}
      </div>

      {/* Búsqueda + Filtros */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] h-10 pl-9 pr-3 text-sm hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setRarityFilter("all")}
              aria-pressed={rarityFilter === "all"}
              className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                rarityFilter === "all" ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Toda rareza
            </button>
            {ITEM_RARITIES.map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                aria-pressed={rarityFilter === r}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                  rarityFilter === r ? ITEM_RARITY_COLOR[r] : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {ITEM_RARITY_LABELS[r]}
              </button>
            ))}
          </div>

          {types.length > 0 && (
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={() => setTypeFilter("all")}
                aria-pressed={typeFilter === "all"}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                  typeFilter === "all" ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Todo tipo
              </button>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  aria-pressed={typeFilter === t}
                  className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                    typeFilter === t ? "bg-[var(--accent-gold)]/15 text-[var(--accent-gold)] border-[var(--accent-gold)]/30" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 mb-6">
            <Package className="h-10 w-10 text-[var(--accent-gold)]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            {isMaster ? "Sin objetos todavía" : "Aún no conoces ningún objeto"}
          </h3>
          {isMaster && (
            <>
              <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                Crea el botín, armas y tesoros de tu mundo. Podés generarlos con IA.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href={`/${campaignSlug}/ai-forge`} className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] text-sm bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 text-[var(--accent-arcane)]">
                  <Sparkles className="h-4 w-4" /> Generar con IA
                </Link>
                <Link href={`/${campaignSlug}/items/new`} className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]">
                  <Plus className="h-4 w-4" /> Crear manualmente
                </Link>
              </div>
            </>
          )}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-16">No hay objetos con esos filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((item) => (
            <ItemCard key={item.id} item={item} campaignSlug={campaignSlug} isMaster={isMaster} />
          ))}
        </div>
      )}
    </div>
  );
}
