"use client";

import { useState } from "react";
import { Heart, Plus, Minus, Lock } from "lucide-react";

interface Props {
  npcId: string;
  hitPoints: number;
  maxHitPoints: number;
}

// Control de vida del NPC para el detalle — solo lo renderiza el máster.
export function NpcHpControl({ npcId, hitPoints, maxHitPoints }: Props) {
  const [hp, setHp] = useState(hitPoints);

  const hpPercent = maxHitPoints > 0 ? Math.round((hp / maxHitPoints) * 100) : 0;
  const hpColor = hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171";

  const changeHp = (delta: number) => {
    setHp((prev) => {
      const next = Math.max(0, Math.min(maxHitPoints, prev + delta));
      fetch(`/api/npcs/${npcId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitPoints: next }),
      }).catch(() => {});
      return next;
    });
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-amber-700/30 rounded-[var(--radius-xl)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-sm text-amber-400 font-medium">
          <Heart className="h-4 w-4" /> Vida
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
          <Lock className="h-3 w-3" /> Solo máster
        </span>
      </div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-[var(--text-muted)]">Puntos de golpe</span>
        <span className="font-semibold" style={{ color: hpColor }}>{hp}/{maxHitPoints}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => changeHp(-1)} aria-label="Restar 1 PV" className="h-8 w-8 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#f87171] transition-colors">
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${hpPercent}%`, background: hpColor }} />
        </div>
        <button onClick={() => changeHp(1)} aria-label="Sumar 1 PV" className="h-8 w-8 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#34d399] transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
