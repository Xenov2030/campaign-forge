import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { SessionForm } from "@/components/campaign/session-form";
import type { SessionMember, SessionFormValues } from "@/components/campaign/session-form";
import { SessionDangerZone } from "@/components/campaign/session-danger-zone";

interface PageProps {
  params: Promise<{ campaignSlug: string; sessionId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { sessionId } = await params;
  const s = await prisma.session.findUnique({ where: { id: sessionId }, select: { number: true, title: true } });
  return { title: `Editar sesión ${s?.number ?? ""}` };
}

export default async function EditSessionPage({ params }: PageProps) {
  const { campaignSlug, sessionId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      campaign: {
        select: {
          masterId: true,
          slug: true,
          members: {
            select: {
              user: { select: { id: true, displayName: true, avatarUrl: true } },
            },
          },
        },
      },
    },
  });
  if (!session) notFound();
  if (session.campaign.masterId !== user.id) redirect(`/${campaignSlug}/sessions`);

  const members: SessionMember[] = session.campaign.members.map(
    (m: { user: { id: string; displayName: string; avatarUrl: string | null } }) => ({
      userId: m.user.id,
      displayName: m.user.displayName,
      avatarUrl: m.user.avatarUrl,
    }),
  );

  // Extraer fecha y hora por separado del DateTime guardado
  let dateStr = "";
  let timeStr = "";
  if (session.date) {
    const d = session.date;
    dateStr = d.toISOString().slice(0, 10);
    const h = d.getHours().toString().padStart(2, "0");
    const m = d.getMinutes().toString().padStart(2, "0");
    if (!(h === "00" && m === "00")) timeStr = `${h}:${m}`;
  }

  const initial: Partial<SessionFormValues> = {
    title: session.title ?? "",
    date: dateStr,
    time: timeStr,
    duration: session.duration?.toString() ?? "",
    summary: session.summary ?? "",
    notes: session.notes ?? "",
    status: session.status,
    isPresential: session.isPresential,
    attendeeIds: session.attendeeIds,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <Link
        href={`/${campaignSlug}/sessions/${sessionId}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al detalle
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">
            Sesión #{session.number}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {session.title ?? "Sin título"}
          </p>
        </div>
      </div>

      <SessionForm
        campaignSlug={campaignSlug}
        campaignId={session.campaignId}
        mode="edit"
        sessionId={sessionId}
        members={members}
        initial={initial}
      />

      <SessionDangerZone
        slug={campaignSlug}
        sessionId={sessionId}
        sessionName={session.title ?? `Sesión ${session.number}`}
      />
    </div>
  );
}
