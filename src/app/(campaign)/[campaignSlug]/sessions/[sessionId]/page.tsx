import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Calendar, Clock, Users, Home, Wifi, Pencil, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ campaignSlug: string; sessionId: string }>;
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

export default async function SessionDetailPage({ params }: PageProps) {
  const { campaignSlug, sessionId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { campaign: { select: { masterId: true, members: { select: { userId: true } } } } },
  });
  if (!session) notFound();

  const isMaster = session.campaign.masterId === user.id;
  const isMember = isMaster || session.campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) redirect("/dashboard");

  // Resolver nombres de asistentes
  const attendees = session.attendeeIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: session.attendeeIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      })
    : [];

  const dateLabel = session.date
    ? new Date(session.date).toLocaleDateString("es-AR", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : null;

  const timeLabel = (() => {
    if (!session.date) return null;
    const d = new Date(session.date);
    const h = d.getHours();
    const m = d.getMinutes();
    if (h === 0 && m === 0) return null;
    return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Barra superior */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/${campaignSlug}/sessions`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a sesiones
        </Link>
        {isMaster && (
          <Link
            href={`/${campaignSlug}/sessions/${sessionId}/edit`}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[var(--radius-md)] border border-[var(--border-default)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-gold)] transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 shrink-0 rounded-[var(--radius-lg)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
            <span className="font-display text-sm font-black text-[var(--text-muted)]">#{session.number}</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)] mb-1.5">
              {session.title ?? `Sesión ${session.number}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wide", STATUS_COLORS[session.status])}>
                {STATUS_LABELS[session.status]}
              </span>
              <span className={cn(
                "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium",
                session.isPresential
                  ? "bg-[#34d399]/10 text-[#34d399] border-[#34d399]/30"
                  : "bg-[#60a5fa]/10 text-[#60a5fa] border-[#60a5fa]/30",
              )}>
                {session.isPresential ? <Home className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                {session.isPresential ? "Presencial" : "Online"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de la sesión */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {dateLabel ? (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
            <Calendar className="h-4 w-4 text-[#a855f7] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Fecha</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{dateLabel}</p>
              {timeLabel && <p className="text-xs text-[var(--text-muted)] mt-0.5">{timeLabel} hs</p>}
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
            <Calendar className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Fecha</p>
              <p className="text-sm text-[var(--text-muted)]">Sin definir</p>
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
          <Clock className="h-4 w-4 text-[var(--accent-gold)] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Duración</p>
            {session.duration
              ? <p className="text-sm font-medium text-[var(--text-primary)]">{session.duration} min</p>
              : <p className="text-sm text-[var(--text-muted)]">Sin definir</p>
            }
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
          {session.isPresential
            ? <Home className="h-4 w-4 text-[#34d399] shrink-0 mt-0.5" />
            : <Wifi className="h-4 w-4 text-[#60a5fa] shrink-0 mt-0.5" />
          }
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Modalidad</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {session.isPresential ? "Presencial" : "Online"}
            </p>
          </div>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-start gap-3">
          <Users className="h-4 w-4 text-[#34d399] shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Asistentes</p>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {attendees.length > 0 ? `${attendees.length} jugadores` : "Sin asistentes"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Asistentes */}
        {attendees.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Asistentes</h2>
            <div className="flex flex-wrap gap-3">
              {attendees.map((a: { id: string; displayName: string; avatarUrl: string | null }) => (
                <div key={a.id} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0">
                    {a.avatarUrl ? (
                      <Image src={a.avatarUrl} alt={a.displayName} width={32} height={32} className="object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-[var(--text-muted)]">
                        {a.displayName[0]?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-[var(--text-primary)]">{a.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen */}
        {session.summary && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-5">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Resumen</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{session.summary}</p>
          </div>
        )}

        {/* Notas privadas del máster */}
        {isMaster && session.notes && (
          <div className="bg-[var(--bg-surface)] border border-amber-700/30 rounded-[var(--radius-xl)] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-amber-400">Notas del máster</h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{session.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
