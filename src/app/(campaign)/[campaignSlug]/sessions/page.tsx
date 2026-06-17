import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { SessionsList } from "./sessions-list";
import type { SessionListItem } from "./sessions-list";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Sesiones — ${campaign?.name ?? ""}` };
}

export default async function SessionsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true, members: { select: { userId: true } } },
  });
  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const isMember = isMaster || campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) redirect("/dashboard");

  const sessions = await prisma.session.findMany({
    where: { campaignId: campaign.id },
    orderBy: [{ date: "desc" }, { number: "desc" }],
    select: {
      id: true, number: true, title: true, date: true, status: true,
      isPresential: true, duration: true, attendeeIds: true, summary: true,
    },
  });

  const serialized: SessionListItem[] = sessions.map((s: typeof sessions[number]) => ({
    ...s,
    date: s.date?.toISOString() ?? null,
  }));

  return (
    <SessionsList
      sessions={serialized}
      campaignSlug={campaignSlug}
      isMaster={isMaster}
    />
  );
}
