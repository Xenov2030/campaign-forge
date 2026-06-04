"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

type RollResult = ReturnType<typeof rollDice>;

interface DiceRollerProps {
  onRollComplete?: (result: RollResult) => void;
}

function DiceSVG({ sides, color, size = 48 }: { sides: number; color: string; size?: number }) {
  const c = { fill: "none", stroke: color, strokeWidth: 1.5, strokeLinejoin: "round" as const };
  const f = { ...c, strokeOpacity: 0.35 };
  const dim = { width: size, height: size, viewBox: "0 0 24 24" };

  switch (sides) {
    case 4:
      return (
        <svg {...dim} {...c}>
          <polygon points="12,2 23,21 1,21" />
          <line x1="12" y1="2" x2="7" y2="15" {...f} />
          <line x1="12" y1="2" x2="17" y2="15" {...f} />
          <line x1="1" y1="21" x2="17" y2="15" {...f} />
          <line x1="23" y1="21" x2="7" y2="15" {...f} />
        </svg>
      );
    case 6:
      return (
        <svg {...dim} {...c}>
          <rect x="2" y="2" width="20" height="20" rx="3" />
          <circle cx="8.5" cy="8.5" r="1.3" fill={color} stroke="none" />
          <circle cx="15.5" cy="8.5" r="1.3" fill={color} stroke="none" />
          <circle cx="8.5" cy="15.5" r="1.3" fill={color} stroke="none" />
          <circle cx="15.5" cy="15.5" r="1.3" fill={color} stroke="none" />
        </svg>
      );
    case 8:
      return (
        <svg {...dim} {...c}>
          <polygon points="12,2 22,12 12,22 2,12" />
          <line x1="2" y1="12" x2="22" y2="12" {...f} />
          <line x1="12" y1="2" x2="12" y2="22" {...f} />
        </svg>
      );
    case 10:
      return (
        <svg {...dim} {...c}>
          <polygon points="12,2 22,10 18,22 6,22 2,10" />
          <line x1="12" y1="2" x2="12" y2="22" {...f} />
          <line x1="2" y1="10" x2="22" y2="10" {...f} />
        </svg>
      );
    case 12:
      return (
        <svg {...dim} {...c}>
          <polygon points="12,2 21,8.5 17.5,20 6.5,20 3,8.5" />
          <polygon points="12,6.5 18,11 15.5,18.5 8.5,18.5 6,11" {...f} />
        </svg>
      );
    case 20:
      return (
        <svg {...dim} {...c}>
          <polygon points="12,2 23,21 1,21" />
          <polygon points="12,7.5 19.5,21 4.5,21" {...f} />
          <line x1="12" y1="2" x2="19.5" y2="21" {...f} />
          <line x1="12" y1="2" x2="4.5" y2="21" {...f} />
          <line x1="4.5" y1="21" x2="19.5" y2="21" {...f} />
        </svg>
      );
    case 100:
      return (
        <svg {...dim} {...c}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" {...f} />
        </svg>
      );
    default:
      return (
        <svg {...dim} {...c}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
  }
}

export function DiceRoller({ onRollComplete }: DiceRollerProps = {}) {
  const { addDiceRoll } = useCampaignStore();
  const [count, setCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [selectedDie, setSelectedDie] = useState(20);
  const [lastResult, setLastResult] = useState<RollResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const selectedDieInfo = DICE_TYPES.find((d) => d.sides === selectedDie) ?? DICE_TYPES[5];

  const handleRoll = useCallback(async () => {
    if (isRolling) return;
    setIsRolling(true);
    setLastResult(null);
    await new Promise((r) => setTimeout(r, 1500));
    const result = rollDice(`${count}d${selectedDie}${modifier >= 0 ? `+${modifier}` : modifier}`);
    setLastResult(result);
    setIsRolling(false);
    addDiceRoll({ ...result, timestamp: new Date() });
    onRollComplete?.(result);
  }, [count, selectedDie, modifier, addDiceRoll, onRollComplete, isRolling]);

  const handleQuickSelect = (sides: number) => {
    if (isRolling) return;
    setSelectedDie(sides);
    setCount(1);
    setModifier(0);
  };

  return (
    <div className="space-y-6">
      {/* Quick die selection — no auto-roll */}
      <div>
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">Elegí tu dado</p>
        <div className="grid grid-cols-4 gap-2">
          {DICE_TYPES.map((die) => (
            <button
              key={die.sides}
              onClick={() => handleQuickSelect(die.sides)}
              disabled={isRolling}
              className="dice h-12 w-full rounded-[var(--radius-md)] text-sm font-display font-bold transition-all hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: die.color,
                color: die.color,
                boxShadow: selectedDie === die.sides ? `0 0 14px ${die.color}60` : "none",
                background: selectedDie === die.sides ? `${die.color}18` : "transparent",
                transform: selectedDie === die.sides ? "scale(1.05)" : "scale(1)",
              }}
            >
              {die.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom modifiers */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 space-y-3">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Configurar tirada</p>

        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">Cantidad</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount((c) => Math.max(1, c - 1))} disabled={isRolling}
                className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold cursor-pointer disabled:opacity-40">−</button>
              <span className="text-[var(--text-primary)] font-display font-bold w-6 text-center">{count}</span>
              <button onClick={() => setCount((c) => Math.min(20, c + 1))} disabled={isRolling}
                className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold cursor-pointer disabled:opacity-40">+</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">Dado</span>
            <select
              value={selectedDie}
              onChange={(e) => setSelectedDie(Number(e.target.value))}
              disabled={isRolling}
              className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded text-sm text-[var(--text-primary)] px-2 disabled:opacity-40"
            >
              {DICE_TYPES.map((d) => (
                <option key={d.sides} value={d.sides}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-[var(--text-muted)]">Mod</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setModifier((m) => m - 1)} disabled={isRolling}
                className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold cursor-pointer disabled:opacity-40">−</button>
              <span className="text-[var(--text-primary)] font-display font-bold w-8 text-center text-sm">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button onClick={() => setModifier((m) => m + 1)} disabled={isRolling}
                className="h-7 w-7 rounded bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold cursor-pointer disabled:opacity-40">+</button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRoll}
          loading={isRolling}
          disabled={isRolling}
          className="w-full"
          size="lg"
          style={{ borderColor: selectedDieInfo.color, color: isRolling ? undefined : selectedDieInfo.color } as React.CSSProperties}
        >
          {isRolling ? "Tirando..." : `Tirar ${count}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`}
        </Button>
      </div>

      {/* Rolling animation / Result */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-6 text-center border"
            style={{ borderColor: `${selectedDieInfo.color}30` }}
          >
            <motion.div
              className="mx-auto mb-4 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            >
              <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={60} />
            </motion.div>
            <p className="text-sm text-[var(--text-muted)]">
              Tirando {count}d{selectedDie}
              {modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
              ...
            </p>
          </motion.div>
        ) : lastResult ? (
          <motion.div
            key="result"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 220 }}
            className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-5 text-center border"
            style={{ borderColor: `${selectedDieInfo.color}30` }}
          >
            <motion.div
              className="flex items-center justify-center mb-2"
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
            >
              <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={44} />
            </motion.div>
            <p className="text-xs text-[var(--text-muted)] mb-1">{lastResult.notation}</p>
            <motion.p
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 8, stiffness: 180, delay: 0.08 }}
              className="font-display text-6xl font-bold mb-3 leading-none"
              style={{ color: selectedDieInfo.color }}
            >
              {lastResult.total}
            </motion.p>
            <div className="flex flex-wrap gap-1 justify-center">
              {lastResult.rolls.map((r, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, type: "spring", damping: 12 }}
                  className="inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold bg-[var(--bg-overlay)] text-[var(--text-secondary)]"
                >
                  {r}
                </motion.span>
              ))}
            </div>
            {lastResult.modifier !== 0 && (
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Modificador: {lastResult.modifier >= 0 ? `+${lastResult.modifier}` : lastResult.modifier}
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
