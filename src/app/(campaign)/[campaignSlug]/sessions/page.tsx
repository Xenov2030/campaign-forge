import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Plus, Calendar, Clock, CheckCircle, Circle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export default async function SessionsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, name: true },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;

  const sessions = await prisma.session.findMany({
    where: { campaignId: campaign.id },
    include: { master: { select: { displayName: true } } },
    orderBy: { number: "desc" },
  });

  const statusLabels: Record<string, string> = {
    PLANNED: "Planificada",
    IN_PROGRESS: "En curso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  };

  const statusColors: Record<string, string> = {
    PLANNED: "#94a3b8",
    IN_PROGRESS: "#34d399",
    COMPLETED: "#60a5fa",
    CANCELLED: "#f87171",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-5 w-5 text-[#a855f7]" />
            <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Sesiones</h1>
          </div>
          <p className="text-sm text-[var(--text-muted)]">{sessions.length} sesiones registradas</p>
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

      {sessions.length === 0 ? (
        <div className="text-center py-24">
          <Calendar className="h-16 w-16 text-[#a855f7]/30 mx-auto mb-4" />
          <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-3">Sin sesiones registradas</h3>
          <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
            {isMaster ? "Registra tus sesiones para llevar un historial de la campaña." : "El máster aún no ha registrado sesiones."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: (typeof sessions)[0]) => (
            <Link
              key={session.id}
              href={`/${campaignSlug}/sessions/${session.id}`}
              className="group flex items-start gap-4 p-5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] hover:border-[var(--border-default)] transition-all"
            >
              {/* Session number */}
              <div className="flex-shrink-0 h-12 w-12 rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center">
                <span className="font-display text-lg font-bold text-[var(--accent-gold)]">
                  #{session.number}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-base font-semibold text-[var(--text-primary)] group-hover:text-[#a855f7] transition-colors">
                      {session.title ?? `Sesión #${session.number}`}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                      {session.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.date)}
                        </span>
                      )}
                      {session.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration}h
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      color: statusColors[session.status],
                      background: `${statusColors[session.status]}15`,
                      border: `1px solid ${statusColors[session.status]}30`,
                    }}
                  >
                    {statusLabels[session.status]}
                  </span>
                </div>

                {(session.aiSummary ?? session.summary) && (
                  <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2 leading-relaxed">
                    {session.aiSummary ?? session.summary}
                  </p>
                )}
              </div>

              {(session.aiSummary ?? session.summary) ? (
                <CheckCircle className="h-4 w-4 text-[#34d399] shrink-0 mt-1" />
              ) : (
                <Circle className="h-4 w-4 text-[var(--text-muted)] shrink-0 mt-1" />
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
