import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar, Clock, Users, Home, Wifi } from "lucide-react";
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
  if (isMaster) redirect(`/${campaignSlug}/sessions/${sessionId}/edit`);

  const isMember = session.campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) redirect("/dashboard");

  const dateLabel = session.date
    ? new Date(session.date).toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
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
      <Link
        href={`/${campaignSlug}/sessions`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a sesiones
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="h-10 w-10 shrink-0 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center">
          <span className="font-display text-sm font-black text-[var(--text-muted)]">#{session.number}</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">
            {session.title ?? `Sesión ${session.number}`}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
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

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {dateLabel && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-[#a855f7] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Fecha</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{dateLabel}</p>
              {timeLabel && <p className="text-xs text-[var(--text-muted)]">{timeLabel}</p>}
            </div>
          </div>
        )}
        {session.duration && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-[var(--accent-gold)] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Duración</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{session.duration} min</p>
            </div>
          </div>
        )}
        {session.attendeeIds.length > 0 && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
            <Users className="h-4 w-4 text-[#34d399] shrink-0" />
            <div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Asistentes</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{session.attendeeIds.length} jugadores</p>
            </div>
          </div>
        )}
      </div>

      {session.summary && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6 mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Resumen</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{session.summary}</p>
        </div>
      )}

      {session.recap && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-6">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Recap</h2>
          <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{session.recap}</p>
        </div>
      )}
    </div>
  );
}
