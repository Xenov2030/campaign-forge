"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { QuestType, QuestStatus } from "@prisma/client";
import { QUEST_TYPE_LABELS, QUEST_STATUS_LABELS, QUEST_TYPE_COLOR, type QuestObjective } from "@/lib/quests";
import { QuestStatusSelect } from "@/components/campaign/quest-status-select";

export interface QuestCardData {
  id: string;
  name: string;
  type: QuestType;
  status: QuestStatus;
  description: string | null;
  isKnownToParty: boolean;
  objectives: QuestObjective[];
  tags: string[];
}

const STATUS_STYLE: Record<QuestStatus, string> = {
  ACTIVE: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  COMPLETED: "bg-green-900/20 text-green-400 border-green-800/40",
  FAILED: "bg-red-900/20 text-red-400 border-red-800/40",
  INACTIVE: "bg-gray-800/40 text-gray-400 border-[var(--border-subtle)]",
};

export function QuestCard({
  quest,
  campaignSlug,
  isMaster,
}: {
  quest: QuestCardData;
  campaignSlug: string;
  isMaster: boolean;
}) {
  const router = useRouter();
  const [known, setKnown] = useState(quest.isKnownToParty);
  const [busy, setBusy] = useState(false);

  const total = quest.objectives.length;
  const done = quest.objectives.filter((o) => o.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !known;
    setKnown(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/quests/${quest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isKnownToParty: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "Misión visible para el grupo" : "Misión oculta a los jugadores");
      router.refresh();
    } catch {
      setKnown(!next);
      toast.error("No se pudo cambiar la visibilidad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5 hover:border-[var(--border-default)] transition-all campaign-card ${
        isMaster && !known ? "opacity-70" : ""
      }`}
    >
      {/* Info (clickeable → detalle) */}
      <Link href={`/${campaignSlug}/quests/${quest.id}`} className="group flex-1 min-w-0 block">
        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${QUEST_TYPE_COLOR[quest.type]}`}>
            {QUEST_TYPE_LABELS[quest.type]}
          </span>
          {!isMaster && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLE[quest.status]}`}>
              {QUEST_STATUS_LABELS[quest.status]}
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold text-[var(--text-primary)] group-hover:text-[#f59e0b] transition-colors">
          {quest.name}
        </h3>
        {quest.description && (
          <p className="text-sm text-[var(--text-secondary)] line-clamp-1 leading-relaxed mt-0.5">{quest.description}</p>
        )}
      </Link>

      {/* Progreso de objetivos */}
      {total > 0 && (
        <div className="sm:w-44 shrink-0">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
            <span>Objetivos</span>
            <span>{done}/{total}</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
            <div className="h-full rounded-full bg-[#f59e0b] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Controles (solo máster) */}
      {isMaster && (
        <div className="flex items-center gap-2 shrink-0">
          <QuestStatusSelect questId={quest.id} initial={quest.status} />
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={busy}
            aria-label={known ? "Ocultar a los jugadores" : "Mostrar al grupo"}
            title={known ? "Visible — clic para ocultar" : "Oculta — clic para mostrar"}
            className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center border transition-colors disabled:opacity-50 ${
              known
                ? "bg-green-900/30 border-green-700/40 text-green-300 hover:bg-green-900/50"
                : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : known ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
