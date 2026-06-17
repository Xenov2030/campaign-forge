"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Calendar, Home, Wifi, Search, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SessionListItem {
  id: string;
  number: number;
  title: string | null;
  date: string | null;
  status: string;
  isPresential: boolean;
  duration: number | null;
  attendeeIds: string[];
  summary: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  PLANNED: "Planificada",
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
  IN_PROGRESS: "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30",
  COMPLETED: "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30",
  CANCELLED: "bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--border-subtle)]",
};

interface SessionsListProps {
  sessions: SessionListItem[];
  campaignSlug: string;
  isMaster: boolean;
}

type StatusFilter = "all" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
type ModeFilter = "all" | "presential" | "online";

export function SessionsList({ sessions, campaignSlug, isMaster }: SessionsListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");

  const shown = sessions.filter((s) => {
    const q = search.trim().toLowerCase();
    const nameOk = !q || s.title?.toLowerCase().includes(q) || `sesión ${s.number}`.includes(q);
    const statusOk = statusFilter === "all" || s.status === statusFilter;
    const modeOk =
      modeFilter === "all" ||
      (modeFilter === "presential" && s.isPresential) ||
      (modeFilter === "online" && !s.isPresential);
    return nameOk && statusOk && modeOk;
  });

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    if (h === 0 && m === 0) return null;
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-[var(--accent-gold)]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Sesiones</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{sessions.length} sesiones</p>
        </div>
        {isMaster && (
          <Link
            href={`/${campaignSlug}/sessions/new`}
            className="inline-flex items-center gap-1.5 h-9 px-4 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)] hover:brightness-110 transition-all"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva sesión
          </Link>
        )}
      </div>

      {/* Filtros — siempre visibles si hay sesiones */}
      {sessions.length > 0 && (
        <div className="flex flex-col gap-2 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o número…"
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-[var(--radius-md)] h-10 pl-9 pr-3 text-sm hover:border-[var(--border-strong)] focus:outline-none focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-colors placeholder:text-[var(--text-muted)]"
            />
          </div>

          {/* Filtro estado */}
          <div className="flex flex-wrap gap-1">
            {(["all", "PLANNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                aria-pressed={statusFilter === s}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border",
                  statusFilter === s
                    ? s === "all"
                      ? "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)]"
                      : STATUS_COLORS[s]
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
              >
                {s === "all" ? "Todas" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Filtro presencial/online */}
          <div className="flex flex-wrap gap-1">
            {(["all", "presential", "online"] as ModeFilter[]).map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                aria-pressed={modeFilter === m}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors border flex items-center gap-1",
                  modeFilter === m
                    ? m === "presential"
                      ? "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30"
                      : m === "online"
                        ? "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30"
                        : "bg-[var(--bg-overlay)] text-[var(--text-primary)] border-[var(--border-default)]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
                )}
              >
                {m === "all" ? "Cualquier modalidad" : m === "presential" ? <><Home className="h-3 w-3" /> Presencial</> : <><Wifi className="h-3 w-3" /> Online</>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista */}
      {sessions.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/20 mb-6">
            <Calendar className="h-10 w-10 text-[var(--accent-gold)]/50" />
          </div>
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">
            {isMaster ? "Sin sesiones todavía" : "Aún no hay sesiones registradas"}
          </h3>
          {isMaster && (
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto mb-6">
              Registrá la fecha, hora y asistentes de cada encuentro con tu grupo.
            </p>
          )}
          {isMaster && (
            <Link
              href={`/${campaignSlug}/sessions/new`}
              className="inline-flex items-center gap-2 h-10 px-5 bg-[var(--accent-gold)] text-[var(--bg-base)] text-sm font-semibold rounded-[var(--radius-md)]"
            >
              <Plus className="h-4 w-4" /> Crear primera sesión
            </Link>
          )}
        </div>
      ) : shown.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-16">No hay sesiones con esos filtros.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((s) => (
            <Link
              key={s.id}
              href={isMaster ? `/${campaignSlug}/sessions/${s.id}/edit` : `/${campaignSlug}/sessions/${s.id}`}
              className="group flex items-start gap-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-[var(--radius-xl)] p-4 transition-all"
            >
              {/* Número */}
              <div className="h-10 w-10 shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
                <span className="font-display text-sm font-black text-[var(--text-muted)]">
                  #{s.number}
                </span>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-gold)] transition-colors">
                    {s.title ?? `Sesión ${s.number}`}
                  </h3>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide", STATUS_COLORS[s.status])}>
                    {STATUS_LABELS[s.status]}
                  </span>
                  {/* Modalidad */}
                  <span className={cn(
                    "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                    s.isPresential
                      ? "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30"
                      : "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30",
                  )}>
                    {s.isPresential ? <Home className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                    {s.isPresential ? "Presencial" : "Online"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                  {s.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(s.date)}
                      {formatTime(s.date) && ` · ${formatTime(s.date)}`}
                    </span>
                  )}
                  {s.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {s.duration}min
                    </span>
                  )}
                  {s.attendeeIds.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {s.attendeeIds.length} asistentes
                    </span>
                  )}
                </div>

                {s.summary && (
                  <p className="text-xs text-[var(--text-muted)] mt-1.5 line-clamp-2">{s.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
