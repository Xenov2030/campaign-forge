"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCampaignStore } from "@/store/campaign-store";
import { rollDice } from "@/lib/utils";

const DICE_TYPES = [
  { sides: 4,   label: "d4",   color: "#c084fc" },
  { sides: 6,   label: "d6",   color: "#60a5fa" },
  { sides: 8,   label: "d8",   color: "#34d399" },
  { sides: 10,  label: "d10",  color: "#f59e0b" },
  { sides: 12,  label: "d12",  color: "#f87171" },
  { sides: 20,  label: "d20",  color: "#c9a84c" },
  { sides: 100, label: "d%",   color: "#94a3b8" },
];

type RollResult = ReturnType<typeof rollDice>;

interface DiceRollerProps {
  onRollComplete?: (result: RollResult) => void;
}

function DiceSVG({ sides, color, size = 48 }: { sides: number; color: string; size?: number }) {
  const stroke = { fill: "none", stroke: color, strokeWidth: 1.5, strokeLinejoin: "round" as const };
  const faint  = { ...stroke, strokeOpacity: 0.4 };
  const dim    = { width: size, height: size, viewBox: "0 0 24 24" };

  switch (sides) {
    case 4:
      return (
        <svg {...dim}>
          <polygon points="12,2 23,21 1,21" {...stroke} />
          <line x1="12" y1="2"  x2="7"  y2="15" {...faint} />
          <line x1="12" y1="2"  x2="17" y2="15" {...faint} />
          <line x1="1"  y1="21" x2="17" y2="15" {...faint} />
          <line x1="23" y1="21" x2="7"  y2="15" {...faint} />
        </svg>
      );
    case 6:
      return (
        <svg {...dim}>
          <rect x="2" y="2" width="20" height="20" rx="3" {...stroke} />
          <circle cx="8.5"  cy="8.5"  r="1.4" fill={color} stroke="none" />
          <circle cx="15.5" cy="8.5"  r="1.4" fill={color} stroke="none" />
          <circle cx="8.5"  cy="15.5" r="1.4" fill={color} stroke="none" />
          <circle cx="15.5" cy="15.5" r="1.4" fill={color} stroke="none" />
        </svg>
      );
    case 8:
      return (
        <svg {...dim}>
          <polygon points="12,2 22,12 12,22 2,12" {...stroke} />
          <line x1="2" y1="12" x2="22" y2="12" {...faint} />
          <line x1="12" y1="2" x2="12" y2="22" {...faint} />
        </svg>
      );
    case 10:
      return (
        <svg {...dim}>
          <polygon points="12,2 22,10 18,22 6,22 2,10" {...stroke} />
          <line x1="12" y1="2"  x2="12" y2="22" {...faint} />
          <line x1="2"  y1="10" x2="22" y2="10" {...faint} />
        </svg>
      );
    case 12:
      return (
        <svg {...dim}>
          <polygon points="12,2 21,8.5 17.5,20 6.5,20 3,8.5" {...stroke} />
          <polygon points="12,6.5 18,11 15.5,18.5 8.5,18.5 6,11" {...faint} />
        </svg>
      );
    case 20:
      return (
        <svg {...dim}>
          <polygon points="12,2 23,21 1,21" {...stroke} />
          <polygon points="12,7.5 19.5,21 4.5,21" {...faint} />
          <line x1="12" y1="2"  x2="19.5" y2="21" {...faint} />
          <line x1="12" y1="2"  x2="4.5"  y2="21" {...faint} />
          <line x1="4.5" y1="21" x2="19.5" y2="21" {...faint} />
        </svg>
      );
    case 100:
      return (
        <svg {...dim}>
          <circle cx="12" cy="12" r="10" {...stroke} />
          <circle cx="12" cy="12" r="5.5" {...faint} />
        </svg>
      );
    default:
      return (
        <svg {...dim}>
          <circle cx="12" cy="12" r="10" {...stroke} />
        </svg>
      );
  }
}

export function DiceRoller({ onRollComplete }: DiceRollerProps = {}) {
  const { addDiceRoll } = useCampaignStore();
  const [count, setCount]       = useState(1);
  const [modifier, setModifier] = useState(0);
  const [selectedDie, setSelectedDie] = useState(20);
  const [lastResult, setLastResult]   = useState<RollResult | null>(null);
  const [isRolling, setIsRolling]     = useState(false);

  const selectedDieInfo = DICE_TYPES.find((d) => d.sides === selectedDie) ?? DICE_TYPES[5];

  const handleRoll = useCallback(async () => {
    if (isRolling) return;
    setIsRolling(true);
    setLastResult(null);
    await new Promise((r) => setTimeout(r, 1200));
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

  const rollLabel = `Tirar ${count}d${selectedDie}${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ""}`;

  return (
    <div className="space-y-5">
      {/* Die selection grid */}
      <div>
        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
          Elegí tu dado
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {DICE_TYPES.map((die) => {
            const isSelected = selectedDie === die.sides;
            return (
              <button
                key={die.sides}
                type="button"
                onClick={() => handleQuickSelect(die.sides)}
                disabled={isRolling}
                className="relative flex flex-col items-center justify-center gap-1 h-[72px] rounded-[var(--radius-md)] border transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                style={{
                  borderColor: isSelected ? die.color : `${die.color}35`,
                  background: isSelected ? `${die.color}16` : `${die.color}06`,
                  boxShadow: isSelected ? `0 0 14px ${die.color}45, inset 0 0 6px ${die.color}12` : "none",
                }}
              >
                <DiceSVG sides={die.sides} color={die.color} size={32} />
                <span
                  className="text-[11px] font-display font-bold leading-none"
                  style={{ color: die.color }}
                >
                  {die.label}
                </span>
                {isSelected && (
                  <span
                    className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full"
                    style={{ background: die.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configurar tirada */}
      <div className="bg-[var(--bg-elevated)] rounded-[var(--radius-lg)] p-4 space-y-3.5">
        <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
          Configurar tirada
        </p>

        <div className="flex gap-3">
          {/* Cantidad */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Cant.</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                disabled={isRolling}
                className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-base transition-colors disabled:opacity-40"
              >
                −
              </button>
              <span className="text-[var(--text-primary)] font-display font-bold w-5 text-center text-sm">
                {count}
              </span>
              <button
                type="button"
                onClick={() => setCount((c) => Math.min(20, c + 1))}
                disabled={isRolling}
                className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-base transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Dado select */}
          <div className="flex-1 flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Dado</span>
            <select
              value={selectedDie}
              onChange={(e) => !isRolling && setSelectedDie(Number(e.target.value))}
              disabled={isRolling}
              className="w-full h-9 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-sm)] text-sm text-[var(--text-primary)] px-2 disabled:opacity-40"
            >
              {DICE_TYPES.map((d) => (
                <option key={d.sides} value={d.sides}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* Modificador */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Mod</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setModifier((m) => m - 1)}
                disabled={isRolling}
                className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-base transition-colors disabled:opacity-40"
              >
                −
              </button>
              <span className="text-[var(--text-primary)] font-display font-bold w-7 text-center text-xs">
                {modifier >= 0 ? `+${modifier}` : modifier}
              </span>
              <button
                type="button"
                onClick={() => setModifier((m) => m + 1)}
                disabled={isRolling}
                className="h-7 w-7 rounded-[var(--radius-sm)] bg-[var(--bg-overlay)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-base transition-colors disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Roll button */}
        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling}
          className="w-full h-11 rounded-[var(--radius-md)] font-display font-bold text-sm tracking-wide border transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98]"
          style={{
            background: `${selectedDieInfo.color}22`,
            borderColor: `${selectedDieInfo.color}60`,
            color: selectedDieInfo.color,
            boxShadow: `0 0 10px ${selectedDieInfo.color}20`,
          }}
        >
          {isRolling ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={18} />
              </motion.span>
              Tirando...
            </>
          ) : (
            <>
              <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={18} />
              {rollLabel}
            </>
          )}
        </button>
      </div>

      {/* Animación de tirada / Resultado */}
      <AnimatePresence mode="wait">
        {isRolling ? (
          <motion.div
            key="rolling"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-[var(--radius-lg)] p-6 text-center border"
            style={{
              background: `${selectedDieInfo.color}08`,
              borderColor: `${selectedDieInfo.color}30`,
            }}
          >
            <motion.div
              className="mx-auto mb-3 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.45, repeat: Infinity, ease: "linear" }}
            >
              <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={56} />
            </motion.div>
            <p className="text-xs text-[var(--text-muted)]">
              Tirando {count}d{selectedDie}
              {modifier !== 0 && (modifier > 0 ? `+${modifier}` : modifier)}
              …
            </p>
          </motion.div>
        ) : lastResult ? (
          <motion.div
            key="result"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 220 }}
            className="rounded-[var(--radius-lg)] p-5 text-center border"
            style={{
              background: `${selectedDieInfo.color}08`,
              borderColor: `${selectedDieInfo.color}35`,
            }}
          >
            <motion.div
              className="flex items-center justify-center mb-2"
              initial={{ rotate: -20, scale: 0.7 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
            >
              <DiceSVG sides={selectedDie} color={selectedDieInfo.color} size={40} />
            </motion.div>

            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">
              {lastResult.notation}
            </p>

            <motion.p
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 8, stiffness: 180, delay: 0.06 }}
              className="font-display text-6xl font-black mb-3 leading-none"
              style={{ color: selectedDieInfo.color }}
            >
              {lastResult.total}
            </motion.p>

            <div className="flex flex-wrap gap-1 justify-center mb-2">
              {lastResult.rolls.map((r, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.12 + i * 0.05, type: "spring", damping: 12 }}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-xs font-bold border"
                  style={{
                    background: `${selectedDieInfo.color}15`,
                    borderColor: `${selectedDieInfo.color}40`,
                    color: selectedDieInfo.color,
                  }}
                >
                  {r}
                </motion.span>
              ))}
            </div>

            {lastResult.modifier !== 0 && (
              <p className="text-xs text-[var(--text-secondary)]">
                Modificador: {lastResult.modifier >= 0 ? `+${lastResult.modifier}` : lastResult.modifier}
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
