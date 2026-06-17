"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Heart, Plus, Minus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export interface NpcCardData {
  id: string;
  name: string;
  nickname: string | null;
  portraitUrl: string | null;
  race: string | null;
  occupation: string | null;
  personality: string | null;
  tags: string[];
  isAlive: boolean;
  isKnownToParty: boolean;
  hitPoints: number | null;
  maxHitPoints: number | null;
}

export function NpcCard({
  npc,
  campaignSlug,
  isMaster,
}: {
  npc: NpcCardData;
  campaignSlug: string;
  isMaster: boolean;
}) {
  const router = useRouter();
  const [known, setKnown] = useState(npc.isKnownToParty);
  const [busy, setBusy] = useState(false);
  const [hp, setHp] = useState(npc.hitPoints ?? 0);

  const hasHp = isMaster && npc.maxHitPoints != null && npc.maxHitPoints > 0;
  const maxHp = npc.maxHitPoints ?? 0;
  const hpPercent = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;
  const hpColor = hpPercent > 50 ? "#34d399" : hpPercent > 25 ? "#f59e0b" : "#f87171";

  // Toggle optimista de visibilidad: refleja el cambio al instante y revierte si falla.
  const toggleVisibility = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !known;
    setKnown(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/npcs/${npc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isKnownToParty: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "NPC visible para el grupo" : "NPC oculto a los jugadores");
      router.refresh();
    } catch {
      setKnown(!next);
      toast.error("No se pudo cambiar la visibilidad");
    } finally {
      setBusy(false);
    }
  };

  const changeHp = (delta: number) => {
    setHp((prev) => {
      const next = Math.max(0, Math.min(maxHp, prev + delta));
      fetch(`/api/npcs/${npc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hitPoints: next }),
      }).catch(() => {});
      return next;
    });
  };

  return (
    <div className={`flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] overflow-hidden campaign-card ${isMaster && !known ? "opacity-70" : ""}`}>
      {/* Header (clickeable → ficha) */}
      <div className="relative">
        <Link
          href={`/${campaignSlug}/npcs/${npc.id}`}
          className="group relative flex items-center gap-3 p-5 overflow-hidden"
        >
          {/* Fondo: retrato difuminado o gradiente */}
          {npc.portraitUrl ? (
            <>
              <Image src={npc.portraitUrl} alt="" aria-hidden="true" fill className="object-cover blur-2xl scale-125 opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-elevated)]/85 to-[var(--bg-overlay)]/85" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-elevated)] to-[var(--bg-overlay)]" />
          )}

          {npc.portraitUrl ? (
            <Image src={npc.portraitUrl} alt={npc.name} width={80} height={80} className="relative h-20 w-20 rounded-full object-cover border-2 border-[#34d399]/30 shrink-0" />
          ) : (
            <div className="relative h-20 w-20 rounded-full bg-[#34d399]/10 border-2 border-[#34d399]/20 flex items-center justify-center shrink-0 font-display text-2xl font-bold text-[#34d399]/60">
              {npc.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="relative min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] group-hover:text-[#34d399] transition-colors truncate">
              {npc.name}
            </h3>
            {npc.nickname && (
              <p className="text-xs italic text-[var(--text-muted)] truncate">«{npc.nickname}»</p>
            )}
            {(npc.race || npc.occupation) && (
              <p className="text-sm text-[var(--text-muted)] truncate">
                {[npc.race, npc.occupation].filter(Boolean).join(" · ")}
              </p>
            )}
            <span className={`inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full border ${npc.isAlive ? "bg-green-900/25 text-green-400 border-green-800/30" : "bg-red-900/25 text-red-400 border-red-800/30"}`}>
              {npc.isAlive ? "Vivo" : "Muerto"}
            </span>
          </div>
          {!isMaster && <ChevronRight className="relative h-5 w-5 text-[var(--text-muted)] group-hover:text-[#34d399] transition-colors shrink-0 self-start" />}
        </Link>

        {/* Toggle de visibilidad (solo máster) */}
        {isMaster && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={busy}
            aria-label={known ? "Ocultar a los jugadores" : "Mostrar al grupo"}
            title={known ? "Conocido por el grupo — clic para ocultar" : "Oculto — clic para mostrar"}
            className={`absolute top-3 right-3 h-9 w-9 rounded-full flex items-center justify-center backdrop-blur-sm border transition-colors disabled:opacity-50 ${
              known
                ? "bg-green-900/40 border-green-700/50 text-green-300 hover:bg-green-900/60"
                : "bg-black/50 border-white/15 text-gray-300 hover:bg-black/70"
            }`}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : known ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}
      </div>

      {(hasHp || npc.personality || npc.tags.length > 0) && (
        <div className="p-4 space-y-3">
          {/* HP — solo máster */}
          {hasHp && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="flex items-center gap-1.5 text-[var(--text-muted)]"><Heart className="h-4 w-4" /> Vida</span>
                <span className="font-semibold" style={{ color: hpColor }}>{hp}/{maxHp}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => changeHp(-1)} aria-label="Restar 1 PV" className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#f87171] transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-overlay)] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${hpPercent}%`, background: hpColor }} />
                </div>
                <button onClick={() => changeHp(1)} aria-label="Sumar 1 PV" className="h-7 w-7 shrink-0 rounded flex items-center justify-center bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[#34d399] transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {npc.personality && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
              {npc.personality}
            </p>
          )}

          {npc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {npc.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
