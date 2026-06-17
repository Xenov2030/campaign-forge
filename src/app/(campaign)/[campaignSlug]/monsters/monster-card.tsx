"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Swords, Shield, Heart, Plus, Minus } from "lucide-react";
import { MONSTER_TAGS } from "@/components/campaign/monster-form";

const DISPOSITION_ORDER = ["legendario", "jefe", "hostil", "neutral", "amigable"];

function parseMaxHp(hp: string | null): number | null {
  if (!hp) return null;
  const match = hp.match(/^(\d+)/);
  return match ? parseInt(match[1]) : null;
}

function getAccentColor(tags: string[]): string {
  for (const d of DISPOSITION_ORDER) {
    if (tags.includes(d)) return MONSTER_TAGS.find((t) => t.value === d)?.color ?? "#94a3b8";
  }
  for (const tag of tags) {
    const found = MONSTER_TAGS.find((t) => t.value === tag);
    if (found) return found.color;
  }
  return "#94a3b8";
}

export interface MonsterCardData {
  id: string;
  name: string;
  type: string | null;
  size: string | null;
  alignment: string | null;
  challengeRating: string | null;
  hitPoints: string | null;
  armorClass: number | null;
  imageUrl: string | null;
  tags: string[];
}

export function MonsterCard({
  monster,
  campaignSlug,
  isMaster,
}: {
  monster: MonsterCardData;
  campaignSlug: string;
  isMaster: boolean;
}) {
  const accent = getAccentColor(monster.tags);
  const dispTag = DISPOSITION_ORDER.find((d) => monster.tags.includes(d));
  const dispOpt = dispTag ? MONSTER_TAGS.find((t) => t.value === dispTag) : null;
  const typeTags = monster.tags.filter((t) => !DISPOSITION_ORDER.includes(t));

  const maxHp = parseMaxHp(monster.hitPoints);
  const [currentHp, setCurrentHp] = useState(maxHp ?? 0);
  const hpPercent = maxHp && maxHp > 0 ? Math.min(100, Math.round((currentHp / maxHp) * 100)) : 0;
  const hpColor = hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171";
  const changeHp = (delta: number) => setCurrentHp((p) => Math.max(0, Math.min(maxHp ?? 0, p + delta)));

  return (
    <div
      className="flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden campaign-card"
      style={{ "--monster-accent": accent } as React.CSSProperties}
    >
      {/* Header (clickeable → detalle) */}
      <div className="relative">
        <Link
          href={`/${campaignSlug}/monsters/${monster.id}`}
          className="group relative flex items-center gap-3 p-5 overflow-hidden"
        >
          {/* Fondo difuminado */}
          {monster.imageUrl ? (
            <>
              <Image src={monster.imageUrl} alt="" aria-hidden fill className="object-cover blur-2xl scale-125 opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-elevated)]/85 to-[var(--bg-overlay)]/85" />
            </>
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(to right, ${accent}18, ${accent}08)` }}
            />
          )}

          {/* Retrato */}
          {monster.imageUrl ? (
            <Image
              src={monster.imageUrl}
              alt={monster.name}
              width={80}
              height={80}
              className="relative h-20 w-20 rounded-full object-cover border-2 shrink-0"
              style={{ borderColor: `${accent}50` }}
            />
          ) : (
            <div
              className="relative h-20 w-20 rounded-full flex items-center justify-center shrink-0 border-2"
              style={{ backgroundColor: `${accent}15`, borderColor: `${accent}30` }}
            >
              <Swords className="h-8 w-8" style={{ color: `${accent}80` }} />
            </div>
          )}

          <div className="relative min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--monster-accent)] transition-colors truncate">
              {monster.name}
            </h3>
            {monster.alignment && (
              <p className="text-xs italic text-[var(--text-muted)] truncate">«{monster.alignment}»</p>
            )}
            {(monster.type || monster.size) && (
              <p className="text-sm text-[var(--text-muted)] truncate">
                {[monster.size, monster.type].filter(Boolean).join(" · ")}
              </p>
            )}
            {dispOpt && (
              <span
                className="inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full border font-semibold"
                style={{
                  color: dispOpt.color,
                  borderColor: `${dispOpt.color}40`,
                  backgroundColor: `${dispOpt.color}20`,
                }}
              >
                {dispOpt.label}
              </span>
            )}
          </div>

          {!isMaster && (
            <ChevronRight className="relative h-5 w-5 text-[var(--text-muted)] group-hover:text-[var(--monster-accent)] transition-colors shrink-0 self-start" />
          )}
        </Link>
      </div>

      {/* Estadísticas, barra de vida y tags */}
      <div className="p-4 space-y-3">
        {/* Badges CR / CA */}
        {(monster.challengeRating || monster.armorClass != null) && (
          <div className="flex items-center gap-3 flex-wrap">
            {monster.challengeRating && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded border"
                style={{ color: accent, borderColor: `${accent}40`, backgroundColor: `${accent}15` }}
              >
                CR {monster.challengeRating}
              </span>
            )}
            {monster.armorClass != null && (
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                <Shield className="h-3.5 w-3.5" /> CA {monster.armorClass}
              </span>
            )}
          </div>
        )}

        {/* HP bar — visible si hay HP parseables */}
        {maxHp != null && maxHp > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1 text-[var(--text-muted)]">
                <Heart className="h-3.5 w-3.5" /> Vida
              </span>
              <span className="font-semibold tabular-nums" style={{ color: hpColor }}>
                {currentHp}/{maxHp}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.preventDefault(); changeHp(-1); }}
                aria-label="Restar 1 PV"
                className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#f87171] transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${hpPercent}%`, background: hpColor }} />
              </div>
              <button
                onClick={(e) => { e.preventDefault(); changeHp(1); }}
                aria-label="Sumar 1 PV"
                className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#34d399] transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Type tags */}
        {typeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {typeTags.slice(0, 3).map((tag) => {
              const opt = MONSTER_TAGS.find((t) => t.value === tag);
              return (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-full border"
                  style={opt ? { color: opt.color, borderColor: `${opt.color}40`, backgroundColor: `${opt.color}10` } : {}}
                >
                  {opt?.label ?? tag}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
