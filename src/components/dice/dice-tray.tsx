"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RotateCcw, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { rollDice } from "@/lib/utils";

const DICE_TYPES = [
  { sides: 4,   label: "d4",   color: "#c084fc" },
  { sides: 6,   label: "d6",   color: "#60a5fa" },
  { sides: 8,   label: "d8",   color: "#34d399" },
  { sides: 10,  label: "d10",  color: "#f59e0b" },
  { sides: 12,  label: "d12",  color: "#f87171" },
  { sides: 20,  label: "d20",  color: "#c9a84c" },
  { sides: 100, label: "d100", color: "#94a3b8" },
];

export function DiceTray() {
  const { diceTrayOpen, setDiceTrayOpen, diceHistory, addDiceRoll } = useCampaignStore();
  const [notation, setNotation] = useState("1d20");
  const [lastResult, setLastResult] = useState<ReturnType<typeof rollDice> | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [count, setCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [selectedDie, setSelectedDie] = useState(20);

  const handleRoll = useCallback(async () => {
    const n = `${count}d${selectedDie}${modifier >= 0 ? `+${modifier}` : modifier}`;
    setIsRolling(true);
    await new Promise((r) => setTimeout(r, 400));

    const result = rollDice(n);
    setLastResult(result);
    setIsRolling(false);

    addDiceRoll({
      ...result,
      timestamp: new Date(),
    });
  }, [count, selectedDie, modifier, addDiceRoll]);

  const handleQuickRoll = (sides: number) => {
    setSelectedDie(sides);
    setCount(1);
    setModifier(0);
    const result = rollDice(`1d${sides}`);
    setLastResult(result);
    addDiceRoll({ ...result, timestamp: new Date() });
  };

  if (!diceTrayOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="dice-backdrop"
        className="fixed inset-0 z-30"
        onClick={() => setDiceTrayOpen(false)}
        aria-hidden="true"
      />
      <motion.div
        key="dice-panel"
        initial={{ opacity: 0, x: 320 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 320 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-80 bg-[var(--bg-surface)] border-l border-[var(--border-default)] z-40 flex flex-col shadow-[var(--shadow-xl)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <h2 className="font-display text-lg text-[var(--accent-gold)]">Bandeja de Dados</h2>
          <Button variant="ghost" size="icon-sm" onClick={() => setDiceTrayOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick dice */}
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Tirada rápida</p>
            <div className="grid grid-cols-4 gap-2">
              {DICE_TYPES.map((die) => (
                <button
                  key={die.sides}
                  onClick={() => handleQuickRoll(die.sides)}
                  className="dice h-12 w-full rounded-[var(--radius-md)] text-sm font-display font-bold transition-all hover:scale-105"
                  style={{
                    borderColor: die.color,
                    color: die.color,
                    boxShadow: selectedDie === die.sides ? `0 0 12px ${die.color}50` : "none",
                    background: selectedDie === die.sides ? `${die.color}15` : "transparent",
                  }}
                >
                  {die.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom roll */}
          <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 space-y-3">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Tirada personalizada</p>

            <div className="flex gap-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-[var(--text-muted)]">Cantidad</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                  >
                    −
                  </button>
                  <span className="text-[var(--text-primary)] font-display font-bold w-6 text-center">{count}</span>
                  <button
                    onClick={() => setCount((c) => Math.min(20, c + 1))}
                    className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[var(--text-muted)]">Dado</span>
                <select
                  value={selectedDie}
                  onChange={(e) => setSelectedDie(Number(e.target.value))}
                  className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] px-2"
                >
                  {DICE_TYPES.map((d) => (
                    <option key={d.sides} value={d.sides}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-[var(--text-muted)]">Mod</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setModifier((m) => m - 1)}
                    className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                  >
                    −
                  </button>
                  <span className="text-[var(--text-primary)] font-display font-bold w-8 text-center text-sm">
                    {modifier >= 0 ? `+${modifier}` : modifier}
                  </span>
                  <button
                    onClick={() => setModifier((m) => m + 1)}
                    className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleRoll}
              loading={isRolling}
              className="w-full"
              size="lg"
            >
              {isRolling ? "Rodando..." : `Tirar ${count}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`}
            </Button>
          </div>

          {/* Last result */}
          <AnimatePresence>
            {lastResult && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 text-center border border-[var(--accent-gold)]/20"
              >
                <p className="text-xs text-[var(--text-muted)] mb-1">Resultado — {lastResult.notation}</p>
                <p className="font-display text-5xl font-bold text-[var(--accent-gold)] mb-2">
                  {lastResult.total}
                </p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {lastResult.rolls.map((r, i) => (
                    <span
                      key={i}
                      className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
                {lastResult.modifier !== 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Modificador: {lastResult.modifier >= 0 ? `+${lastResult.modifier}` : lastResult.modifier}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          {diceHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <History className="h-3 w-3" />
                  Historial
                </p>
              </div>
              <div className="space-y-1">
                {diceHistory.slice(0, 10).map((roll, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded bg-[var(--bg-elevated)] text-xs"
                  >
                    <span className="text-[var(--text-muted)]">{roll.notation}</span>
                    <span className="font-display font-bold text-[var(--accent-gold)]">{roll.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
