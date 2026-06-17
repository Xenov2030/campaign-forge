import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Archive } from "lucide-react";
import { VaultManager } from "@/app/(dashboard)/vault/vault-manager";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata() {
  return { title: "Baúl" };
}

export default async function CampaignVaultPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { masterId: true },
  });
  if (!campaign) notFound();
  if (campaign.masterId !== user.id) redirect(`/${campaignSlug}`);

  const [npcs, monsters, items] = await Promise.all([
    prisma.vaultNpc.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.vaultMonster.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.vaultItem.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="h-5 w-5 text-[#a855f7]" />
          <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Baúl</h1>
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          NPCs, criaturas y objetos guardados para reutilizar en cualquier campaña
        </p>
      </div>
      <VaultManager initialNpcs={npcs} initialMonsters={monsters} initialItems={items} />
    </div>
  );
}
