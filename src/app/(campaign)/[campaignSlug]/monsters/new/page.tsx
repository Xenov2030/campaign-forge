import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { MonsterForm } from "@/components/campaign/monster-form";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export const metadata = { title: "Nuevo monstruo" };

export default async function NewMonsterPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, masterId: true },
  });
  if (!campaign) notFound();
  if (campaign.masterId !== user.id) redirect(`/${campaignSlug}/monsters`);

  return (
    <div className="px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Nuevo monstruo</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Creá una nueva entrada para el bestiario</p>
      </div>
      <MonsterForm slug={campaignSlug} mode="create" campaignId={campaign.id} />
    </div>
  );
}
