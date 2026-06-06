"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, Dices, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { DiceRoller } from "./dice-roller";
import { rollDice } from "@/lib/utils";

type RollResult = ReturnType<typeof rollDice>;

interface DiceTrayProps {
  isMaster?: boolean;
}

export function DiceTray({ isMaster }: DiceTrayProps) {
  const {
    diceTrayOpen,
    setDiceTrayOpen,
    diceHistory,
    addDiceRoll,
    masterHidingRolls,
    setMasterHidingRolls,
    chatSendMessage,
  } = useCampaignStore();

  const handleRollComplete = useCallback(async (result: RollResult) => {
    addDiceRoll({ ...result, timestamp: new Date() });

    if (chatSendMessage) {
      const modStr =
        result.modifier !== 0
          ? result.modifier > 0
            ? `+${result.modifier}`
            : `${result.modifier}`
          : "";
      const content = `🎲 ${result.notation} → [${result.rolls.join(", ")}]${modStr} = **${result.total}**`;
      await chatSendMessage(content, {
        type: "DICE_ROLL",
        metadata: { ...result, masterOnly: isMaster ? masterHidingRolls : false },
      });
    }
  }, [addDiceRoll, chatSendMessage, isMaster, masterHidingRolls]);

  return (
    <>
      {/* Backdrop — closes tray on outside click */}
      <AnimatePresence>
        {diceTrayOpen && (
          <motion.div
            key="dice-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-30"
            onClick={() => setDiceTrayOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Persistent vertical tab — always visible on right edge */}
      <AnimatePresence>
        {!diceTrayOpen && (
          <motion.button
            key="dice-tab"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.18 }}
            onClick={() => setDiceTrayOpen(true)}
            title="Abrir dados"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-2 py-4 px-2.5 bg-[var(--bg-surface)]/95 backdrop-blur-sm border border-r-0 border-[var(--border-subtle)] rounded-l-[var(--radius-lg)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)]/40 hover:bg-[var(--bg-elevated)] transition-all shadow-lg cursor-pointer"
          >
            <Dices className="h-4 w-4 shrink-0" />
            <span
              className="text-[10px] font-semibold uppercase tracking-widest select-none"
              style={{ writingMode: "vertical-rl" }}
            >
              Dados
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {diceTrayOpen && (
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
              <div className="flex items-center gap-2">
                <Dices className="h-4 w-4 text-[var(--accent-gold)]" />
                <h2 className="font-display text-base text-[var(--accent-gold)]">Bandeja de Dados</h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setDiceTrayOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Master hide-rolls toggle */}
              {isMaster && (
                <button
                  onClick={() => setMasterHidingRolls(!masterHidingRolls)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] border transition-all duration-200 text-left",
                    masterHidingRolls
                      ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.15)]"
                      : "bg-[var(--bg-elevated)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                  )}
                >
                  {/* Toggle pill */}
                  <div
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors duration-200 shrink-0",
                      masterHidingRolls ? "bg-amber-500" : "bg-[var(--bg-overlay)]"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                        masterHidingRolls ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </div>

                  {/* Labels */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className={cn(
                      "text-sm font-semibold leading-tight",
                      masterHidingRolls ? "text-amber-400" : "text-[var(--text-secondary)]"
                    )}>
                      {masterHidingRolls ? "Tiradas ocultas" : "Tiradas visibles"}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] leading-tight mt-0.5">
                      {masterHidingRolls
                        ? "Solo tú las ves en el chat"
                        : "Todos los jugadores las ven"}
                    </span>
                  </div>

                  {/* Icon */}
                  {masterHidingRolls
                    ? <EyeOff className="h-4 w-4 text-amber-400 shrink-0" />
                    : <Eye className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  }
                </button>
              )}

              <DiceRoller onRollComplete={handleRollComplete} />

              {/* Session history */}
              {diceHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <History className="h-3 w-3 text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Historial</p>
                  </div>
                  <div className="space-y-1">
                    {diceHistory.slice(0, 10).map((roll, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] text-xs">
                        <span className="text-[var(--text-muted)]">{roll.notation}</span>
                        <span className="font-display font-bold text-[var(--accent-gold)]">{roll.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
