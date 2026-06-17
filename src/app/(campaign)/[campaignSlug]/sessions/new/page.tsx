import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { SessionForm } from "@/components/campaign/session-form";
import type { SessionMember } from "@/components/campaign/session-form";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export const metadata = { title: "Nueva sesión" };

export default async function NewSessionPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: {
      id: true,
      masterId: true,
      members: {
        select: {
          user: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      },
    },
  });
  if (!campaign) notFound();
  if (campaign.masterId !== user.id) redirect(`/${campaignSlug}/sessions`);

  const members: SessionMember[] = campaign.members.map(
    (m: { user: { id: string; displayName: string; avatarUrl: string | null } }) => ({
      userId: m.user.id,
      displayName: m.user.displayName,
      avatarUrl: m.user.avatarUrl,
    }),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <Link
        href={`/${campaignSlug}/sessions`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a sesiones
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-[var(--radius-lg)] bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Nueva sesión</h1>
          <p className="text-sm text-[var(--text-muted)]">Registrá el próximo encuentro</p>
        </div>
      </div>

      <SessionForm
        campaignSlug={campaignSlug}
        campaignId={campaign.id}
        mode="create"
        members={members}
      />
    </div>
  );
}
