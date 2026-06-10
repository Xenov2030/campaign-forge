"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { QuestStatus } from "@prisma/client";
import { QUEST_STATUSES, QUEST_STATUS_LABELS } from "@/lib/quests";

const ACTIVE_STYLE: Record<QuestStatus, string> = {
  ACTIVE: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40",
  COMPLETED: "bg-green-900/25 text-green-400 border-green-800/50",
  FAILED: "bg-red-900/25 text-red-400 border-red-800/50",
  INACTIVE: "bg-gray-800/50 text-gray-300 border-[var(--border-default)]",
};

export function QuestStatusControl({ questId, initial }: { questId: string; initial: QuestStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState<QuestStatus>(initial);
  const [busy, setBusy] = useState(false);

  const change = async (next: QuestStatus) => {
    if (next === status || busy) return;
    const prev = status;
    setStatus(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/quests/${questId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      toast.success("Estado actualizado");
      router.refresh();
    } catch {
      setStatus(prev);
      toast.error("No se pudo cambiar el estado");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-4">
      <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Estado de la misión</p>
      <div className="grid grid-cols-2 gap-2">
        {QUEST_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => change(s)}
            disabled={busy}
            aria-pressed={status === s}
            className={`h-9 px-3 rounded-[var(--radius-md)] text-sm font-medium border transition-colors disabled:opacity-60 ${
              status === s ? ACTIVE_STYLE[s] : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {QUEST_STATUS_LABELS[s]}
          </button>
        ))}
      </div>
    </div>
  );
}
