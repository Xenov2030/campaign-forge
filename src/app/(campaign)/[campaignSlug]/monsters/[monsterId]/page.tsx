import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { MonsterStatBlock } from "@/components/campaign/monster-stat-block";
import { MonsterDeleteButton } from "./monster-delete-button";
import { Pencil, ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ campaignSlug: string; monsterId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { monsterId } = await params;
  const monster = await prisma.monster.findUnique({ where: { id: monsterId }, select: { name: true } });
  return { title: monster?.name ?? "Monstruo" };
}

export default async function MonsterDetailPage({ params }: PageProps) {
  const { campaignSlug, monsterId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const monster = await prisma.monster.findUnique({
    where: { id: monsterId },
    include: { campaign: { include: { members: { select: { userId: true } } } } },
  });
  if (!monster) notFound();

  const { campaign } = monster;
  const isMaster = campaign.masterId === user.id;
  const isMember = isMaster || campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <Link
          href={`/${campaignSlug}/monsters`}
          className="inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Bestiario
        </Link>
        {isMaster && (
          <div className="flex items-center gap-2">
            <Link
              href={`/${campaignSlug}/monsters/${monsterId}/edit`}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--radius-md)] border border-[var(--border-default)] text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-gold)] hover:text-[var(--accent-gold)] transition-colors"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Link>
            <MonsterDeleteButton monsterId={monsterId} campaignSlug={campaignSlug} />
          </div>
        )}
      </div>

      <MonsterStatBlock monster={monster} />
    </div>
  );
}
