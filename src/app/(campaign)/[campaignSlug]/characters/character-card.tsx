"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import * as Popover from "@radix-ui/react-popover";
import { Heart, Plus, Minus, Shield, Zap, Footprints, ChevronRight, X, SmilePlus } from "lucide-react";
import { CONDITIONS, conditionColor } from "@/lib/conditions";
import { formatModifier } from "@/lib/utils";

export interface CharacterCardData {
  id: string;
  name: string;
  race: string | null;
  class: string | null;
  level: number;
  portraitUrl: string | null;
  isAlive: boolean;
  hitPoints: number;
  maxHitPoints: number;
  stats: Record<string, number> | null;
  armorClass: number;
  initiative: number;
  speed: number;
  conditions: string[];
}

const STAT_KEYS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;

export function CharacterCard({
  character,
  campaignSlug,
  canEdit = false,
  isOwn = false,
}: {
  character: CharacterCardData;
  campaignSlug: string;
  canEdit?: boolean;
  isOwn?: boolean;
}) {
  const [hp, setHp] = useState(character.hitPoints);
  const [conditions, setConditions] = useState<string[]>(character.conditions ?? []);

  const patch = (data: { hitPoints?: number; conditions?: string[] }) => {
    fetch(`/api/characters/${character.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  };

  const changeHp = (delta: number) => {
    setHp((prev) => {
      const next = Math.max(0, Math.min(character.maxHitPoints, prev + delta));
      patch({ hitPoints: next });
      return next;
    });
  };

  const toggleCondition = (c: string) => {
    setConditions((prev) => {
      const next = prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c];
      patch({ conditions: next });
      return next;
    });
  };

  const hpPercent = character.maxHitPoints > 0 ? Math.round((hp / character.maxHitPoints) * 100) : 0;
  const hpColor = hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171";
  const stats = character.stats ?? {};

  return (
    <div className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden campaign-card">
      {/* Header (clickeable → ficha) */}
      <Link
        href={`/${campaignSlug}/characters/${character.id}`}
        className="group flex items-center gap-3 p-4 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-overlay)] relative"
      >
        {character.portraitUrl ? (
          <Image src={character.portraitUrl} alt={character.name} width={64} height={64} className="h-16 w-16 rounded-full object-cover border-2 border-[#60a5fa]/30 shrink-0" />
        ) : (
          <div className="h-16 w-16 rounded-full bg-[#60a5fa]/10 border-2 border-[#60a5fa]/20 flex items-center justify-center shrink-0 font-display text-xl font-bold text-[#60a5fa]/60">
            {character.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-[var(--text-primary)] group-hover:text-[#60a5fa] transition-colors truncate">
            {character.name}
          </h3>
          <p className="text-sm text-[var(--text-muted)] truncate">
            {[character.race, character.class].filter(Boolean).join(" · ")}
            {character.level > 0 && ` · Nv. ${character.level}`}
          </p>
          {(isOwn || !character.isAlive) && (
            <div className="flex gap-1.5 mt-2">
              {isOwn && <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/20">Tuyo</span>}
              {!character.isAlive && <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">Muerto</span>}
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-[var(--text-muted)] group-hover:text-[#60a5fa] transition-colors shrink-0 self-start mt-1" />
      </Link>

      <div className="p-4 space-y-4">
        {/* HP */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Heart className="h-4 w-4" /> Puntos de golpe</span>
            <span className="font-semibold" style={{ color: hpColor }}>{hp}/{character.maxHitPoints}</span>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button onClick={() => changeHp(-1)} aria-label="Restar 1 PV" className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#f87171] transition-colors">
                <Minus className="h-4 w-4" />
              </button>
            )}
            <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${hpPercent}%`, background: hpColor }} />
            </div>
            {canEdit && (
              <button onClick={() => changeHp(1)} aria-label="Sumar 1 PV" className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#34d399] transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Atributos */}
        <div className="grid grid-cols-6 gap-1.5">
          {STAT_KEYS.map((k) => {
            const score = stats[k] ?? 10;
            return (
              <div key={k} className="text-center px-1 py-2 rounded-[var(--radius-md)] bg-[var(--bg-elevated)]">
                <p className="text-[10px] text-[var(--text-muted)] uppercase">{k}</p>
                <p className="text-lg font-bold text-[var(--text-primary)] leading-tight">{score}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{formatModifier(score)}</p>
              </div>
            );
          })}
        </div>

        {/* CA · Iniciativa · Velocidad */}
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] px-1">
          <span className="flex items-center gap-1.5" title="Clase de armadura"><Shield className="h-4 w-4 text-[var(--text-muted)]" /> {character.armorClass}</span>
          <span className="flex items-center gap-1.5" title="Iniciativa"><Zap className="h-4 w-4 text-[var(--text-muted)]" /> {character.initiative >= 0 ? `+${character.initiative}` : character.initiative}</span>
          <span className="flex items-center gap-1.5" title="Velocidad"><Footprints className="h-4 w-4 text-[var(--text-muted)]" /> {character.speed} pies</span>
        </div>

        {/* Condiciones */}
        <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] pt-1 border-t border-[var(--border-subtle)]">
          {conditions.map((c) => {
            const color = conditionColor(c);
            return (
              <span
                key={c}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border animate-pulse"
                style={{ color, borderColor: `${color}55`, background: `${color}1a` }}
              >
                {c}
                {canEdit && (
                  <button onClick={() => toggleCondition(c)} aria-label={`Quitar ${c}`} className="hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </span>
            );
          })}
          {canEdit && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button aria-label="Añadir condición" className="h-6 w-6 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors">
                  <SmilePlus className="h-4 w-4" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content side="top" align="start" sideOffset={6} className="z-50 w-52 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-1.5 shadow-[var(--shadow-lg)] max-h-64 overflow-y-auto">
                  <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">Condiciones</p>
                  {CONDITIONS.map((c) => {
                    const active = conditions.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => toggleCondition(c)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded text-sm text-left hover:bg-[var(--bg-elevated)] transition-colors"
                        style={active ? { color: conditionColor(c) } : { color: "var(--text-secondary)" }}
                      >
                        {c}
                        {active && <span className="h-2 w-2 rounded-full" style={{ background: conditionColor(c) }} />}
                      </button>
                    );
                  })}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          )}
        </div>
      </div>
    </div>
  );
}
