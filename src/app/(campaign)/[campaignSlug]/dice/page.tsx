"use client";

import { Construction } from "lucide-react";
import { DiceRoller } from "@/components/dice/dice-roller";
import { formatRelativeTime } from "@/lib/utils";

// ─── Mock data — simulated roll history from multiple players ──────────────
const now = Date.now();
const MOCK_ROLLS = [
  {
    id: "1",
    playerName: "Thorin Martillo",
    initials: "TM",
    color: "#c9a84c",
    notation: "1d20",
    result: 18,
    rolls: [18],
    modifier: 0,
    purpose: "Ataque con hacha de guerra",
    timestamp: new Date(now - 3 * 60000),
  },
  {
    id: "2",
    playerName: "Elara Lunasalada",
    initials: "EL",
    color: "#60a5fa",
    notation: "2d6+3",
    result: 11,
    rolls: [5, 3],
    modifier: 3,
    purpose: "Daño con arco largo",
    timestamp: new Date(now - 7 * 60000),
  },
  {
    id: "3",
    playerName: "Dungeon Master",
    initials: "DM",
    color: "#f87171",
    notation: "1d20",
    result: 4,
    rolls: [4],
    modifier: 0,
    purpose: "Tirada de sigilo del goblin",
    timestamp: new Date(now - 12 * 60000),
  },
  {
    id: "4",
    playerName: "Thorin Martillo",
    initials: "TM",
    color: "#c9a84c",
    notation: "1d12+5",
    result: 14,
    rolls: [9],
    modifier: 5,
    purpose: "Daño crítico",
    timestamp: new Date(now - 18 * 60000),
  },
  {
    id: "5",
    playerName: "Elara Lunasalada",
    initials: "EL",
    color: "#60a5fa",
    notation: "1d20",
    result: 20,
    rolls: [20],
    modifier: 0,
    purpose: "Salvación de Destreza",
    timestamp: new Date(now - 25 * 60000),
  },
  {
    id: "6",
    playerName: "Dungeon Master",
    initials: "DM",
    color: "#f87171",
    notation: "4d6",
    result: 15,
    rolls: [4, 3, 5, 3],
    modifier: 0,
    purpose: "Daño de área del ogro",
    timestamp: new Date(now - 33 * 60000),
  },
  {
    id: "7",
    playerName: "Ser Valkeron",
    initials: "SV",
    color: "#34d399",
    notation: "1d20+4",
    result: 7,
    rolls: [3],
    modifier: 4,
    purpose: "Detección de ilusiones",
    timestamp: new Date(now - 41 * 60000),
  },
  {
    id: "8",
    playerName: "Ser Valkeron",
    initials: "SV",
    color: "#34d399",
    notation: "1d8+3",
    result: 9,
    rolls: [6],
    modifier: 3,
    purpose: "Curación con imposición de manos",
    timestamp: new Date(now - 50 * 60000),
  },
] as const;

function ResultBadge({ total }: { total: number }) {
  const isCrit = total === 20;
  const isFumble = total === 1;
  if (isCrit) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] font-bold border border-[var(--accent-gold)]/30">¡CRÍTICO!</span>;
  if (isFumble) return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">PIFIA</span>;
  return null;
}

export default function DicePage() {
  return (
    <div className="flex flex-col h-full">
      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-2 bg-[var(--accent-gold)]/5 border-b border-[var(--accent-gold)]/15">
        <Construction className="h-3.5 w-3.5 text-[var(--accent-gold)] shrink-0" />
        <p className="text-xs text-[var(--text-muted)]">
          <span className="text-[var(--accent-gold)] font-medium">Datos de ejemplo</span>
          {" — "}El historial de la izquierda usa tiradas simuladas. La sección está en construcción: cuando esté completa mostrará tiradas reales de la sesión.
        </p>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

        {/* Left — Roll history */}
        <div className="md:w-[400px] lg:w-[460px] border-b md:border-b-0 md:border-r border-[var(--border-subtle)] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              Historial de tiradas
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Sesión actual</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-subtle)]">
            {MOCK_ROLLS.map((roll) => (
              <div key={roll.id} className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-elevated)] transition-colors">
                {/* Avatar */}
                <div
                  className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-[var(--bg-base)]"
                  style={{ background: roll.color }}
                >
                  {roll.initials}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                      {roll.playerName}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] shrink-0">
                      {formatRelativeTime(roll.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[var(--text-muted)]">{roll.notation}</span>
                    <span className="text-[var(--border-default)]">→</span>
                    <span
                      className="font-display font-bold text-base leading-none"
                      style={{ color: roll.color }}
                    >
                      {roll.result}
                    </span>
                    <ResultBadge total={roll.result} />
                  </div>

                  {roll.purpose && (
                    <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 italic">
                      {roll.purpose}
                    </p>
                  )}

                  {/* Individual dice */}
                  {roll.rolls.length > 1 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {[...roll.rolls].map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-[var(--bg-overlay)] text-[var(--text-muted)]"
                        >
                          {r}
                        </span>
                      ))}
                      {roll.modifier !== 0 && (
                        <span className="text-[10px] text-[var(--text-muted)] self-center">
                          {roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dice roller */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-sm mx-auto px-4 py-6">
            <h2 className="font-display text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-5">
              Lanzar dados
            </h2>
            <DiceRoller />
          </div>
        </div>

      </div>
    </div>
  );
}
