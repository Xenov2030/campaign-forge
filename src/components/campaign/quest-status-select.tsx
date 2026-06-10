"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { QuestStatus } from "@prisma/client";
import { QUEST_STATUSES, QUEST_STATUS_LABELS } from "@/lib/quests";

const TEXT_COLOR: Record<QuestStatus, string> = {
  ACTIVE: "text-[#f59e0b]",
  COMPLETED: "text-green-400",
  FAILED: "text-red-400",
  INACTIVE: "text-[var(--text-muted)]",
};

interface Props {
  questId: string;
  initial: QuestStatus;
  className?: string;
}

// Selector compacto de estado de la misión (máster). Sirve en la card y en el detalle.
export function QuestStatusSelect({ questId, initial, className = "" }: Props) {
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
    <select
      value={status}
      disabled={busy}
      onChange={(e) => change(e.target.value as QuestStatus)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label="Estado de la misión"
      className={`h-9 px-3 rounded-[var(--radius-md)] text-sm font-medium bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent-gold)] transition-colors disabled:opacity-60 cursor-pointer ${TEXT_COLOR[status]} ${className}`}
    >
      {QUEST_STATUSES.map((s) => (
        <option key={s} value={s} className="text-[var(--text-primary)] bg-[var(--bg-surface)]">
          {QUEST_STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
