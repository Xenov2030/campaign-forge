"use client";

import { useState } from "react";
import Link from "next/link";
import { Target } from "lucide-react";
import type { QuestType } from "@prisma/client";
import { QUEST_TYPE_OPTIONS, QUEST_TYPE_LABELS, QUEST_TYPE_COLOR, type QuestObjective } from "@/lib/quests";

export interface HomeQuest {
  id: string;
  name: string;
  type: QuestType;
  description: string | null;
  objectives: QuestObjective[];
}

export function HomeQuests({
  quests,
  slug,
  isMaster,
}: {
  quests: HomeQuest[];
  slug: string;
  isMaster: boolean;
}) {
  const [typeFilter, setTypeFilter] = useState<"all" | QuestType>("all");
  const shown = typeFilter === "all" ? quests : quests.filter((q) => q.type === typeFilter);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-4 w-4 text-[#f59e0b]" />
        <h2 className="font-display text-base font-semibold text-[var(--text-primary)]">
          {isMaster ? "Misiones activas" : "Tus misiones"}
        </h2>
      </div>

      {quests.length === 0 ? (
        <div className="text-center py-8">
          <Target className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-sm text-[var(--text-muted)]">
            {isMaster ? "No hay misiones activas" : "El máster aún no reveló misiones"}
          </p>
        </div>
      ) : (
        <>
          {/* Filtro por tipo */}
          <div className="flex flex-wrap gap-1 mb-3">
            <button
              onClick={() => setTypeFilter("all")}
              aria-pressed={typeFilter === "all"}
              className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                typeFilter === "all" ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)]" : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              }`}
            >
              Todas
            </button>
            {QUEST_TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                aria-pressed={typeFilter === t}
                className={`h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border ${
                  typeFilter === t ? QUEST_TYPE_COLOR[t] : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {QUEST_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {shown.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">No hay misiones de este tipo.</p>
          ) : (
            <div className="space-y-2">
              {shown.map((q) => {
                const total = q.objectives.length;
                const done = q.objectives.filter((o) => o.completed).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link
                    key={q.id}
                    href={`/${slug}/quests/${q.id}`}
                    className="block p-3 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{q.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${QUEST_TYPE_COLOR[q.type]}`}>
                        {QUEST_TYPE_LABELS[q.type]}
                      </span>
                    </div>
                    {q.description && (
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{q.description}</p>
                    )}
                    {total > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1">
                          <span>Objetivos</span>
                          <span>{done}/{total}</span>
                        </div>
                        <div className="h-1 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                          <div className="h-full rounded-full bg-[#f59e0b]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
