"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCampaignStore } from "@/store/campaign-store";
import { DiceRoller } from "./dice-roller";

export function DiceTray() {
  const { diceTrayOpen, setDiceTrayOpen, diceHistory } = useCampaignStore();

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
              <h2 className="font-display text-lg text-[var(--accent-gold)]">Bandeja de Dados</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setDiceTrayOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <DiceRoller />

              {/* Session history */}
              {diceHistory.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <History className="h-3 w-3 text-[var(--text-muted)]" />
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Historial</p>
                  </div>
                  <div className="space-y-1">
                    {diceHistory.slice(0, 10).map((roll, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded bg-[var(--bg-elevated)] text-xs">
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
