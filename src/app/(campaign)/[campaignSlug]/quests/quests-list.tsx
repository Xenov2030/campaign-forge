"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Target, Sparkles } from "lucide-react";
import { QuestCard, type QuestCardData } from "./quest-card";

type Filter = "all" | "ACTIVE" | "COMPLETED" | "FAILED";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "ACTIVE", label: "Activas" },
  { id: "COMPLETED", label: "Completadas" },
  { id: "FAILED", label: "Falladas" },
];

export function QuestsList({
  quests,
  campaignSlug,
  isMaster,
}: {
  quests: QuestCardData[];
  campaignSlug: string;
  isMaster: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const shown = filter === "all" ? quests : quests.filter((q) => q.status === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-5 w-5 text-[#f59e0b]" />
              <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Misiones</h1>
            </div>
            <p className="text-sm text-[var(--text-muted)]">{quests.length} misiones</p>
          </div>

          {quests.length > 0 && (
            <div className="flex items-center gap-0.5 p-0.5 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={filter === f.id}
                  className={`h-8 px-3 rounded-[var(--radius-sm)] text-xs font-medium transition-colors ${
                    filter === f.id ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  }`}
                >
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
              href={`/${campaignSlug}/quests/new`}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva misión
            </Link>
          </div>
        )}
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#f59e0b]/10 border border-[#f59e0b]/20 mb-6">
            <Target className="h-10 w-10 text-[#f59e0b]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            {isMaster ? "Sin misiones todavía" : "El máster aún no reveló misiones"}
          </h3>
          {isMaster && (
            <>
              <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
                Crea las misiones que guiarán a tus aventureros. Podés generarlas con IA.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href={`/${campaignSlug}/ai-forge`} className="inline-flex items-center gap-2 h-10 px-5 rounded-[var(--radius-md)] text-sm bg-[var(--accent-arcane)]/15 border border-[var(--accent-arcane)]/30 text-[var(--accent-arcane)]">
                  <Sparkles className="h-4 w-4" /> Generar con IA
                </Link>
                <Link href={`/${campaignSlug}/quests/new`} className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]">
                  <Plus className="h-4 w-4" /> Crear manualmente
                </Link>
              </div>
            </>
          )}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-16">No hay misiones en este estado.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shown.map((quest) => (
            <QuestCard key={quest.id} quest={quest} campaignSlug={campaignSlug} isMaster={isMaster} />
          ))}
        </div>
      )}
    </div>
  );
}
