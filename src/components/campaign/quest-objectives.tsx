"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { QuestObjective } from "@/lib/quests";

interface Props {
  questId: string;
  initial: QuestObjective[];
  canEdit: boolean;
}

export function QuestObjectives({ questId, initial, canEdit }: Props) {
  const [objectives, setObjectives] = useState<QuestObjective[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);

  const done = objectives.filter((o) => o.completed).length;
  const total = objectives.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggle = async (id: string) => {
    if (!canEdit || busyId) return;
    const prev = objectives;
    const next = objectives.map((o) => (o.id === id ? { ...o, completed: !o.completed } : o));
    setObjectives(next);
    setBusyId(id);
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectives: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setObjectives(prev); // rollback
      toast.error("No se pudo actualizar el objetivo");
    } finally {
      setBusyId(null);
    }
  };

  if (total === 0) return null;

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-xl)] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-base font-bold text-[var(--text-primary)]">Objetivos</h2>
        <span className="text-sm text-[var(--text-muted)]">{done}/{total}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden mb-4">
        <div className="h-full rounded-full bg-[#f59e0b] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <ul className="space-y-1.5">
        {objectives.map((o) => {
          const Icon = o.completed ? CheckCircle2 : Circle;
          return (
            <li key={o.id}>
              <button
                type="button"
                onClick={() => toggle(o.id)}
                disabled={!canEdit || busyId !== null}
                className={`w-full flex items-start gap-2.5 text-left p-2 rounded-[var(--radius-md)] transition-colors ${
                  canEdit ? "hover:bg-[var(--bg-elevated)] cursor-pointer" : "cursor-default"
                } disabled:opacity-100`}
              >
                {busyId === o.id ? (
                  <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin text-[#f59e0b]" />
                ) : (
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${o.completed ? "text-[#34d399]" : "text-[var(--text-muted)]"}`} />
                )}
                <span className={`text-sm leading-relaxed ${o.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-secondary)]"}`}>
                  {o.description}
                  {o.isOptional && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)] border border-[var(--border-subtle)] rounded px-1 py-0.5">opcional</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
