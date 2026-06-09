import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { CampaignSettingsForm } from "./settings-form";

interface PageProps {
  params: Promise<{ campaignSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { campaignSlug } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
  return { title: `Configuración — ${campaign?.name ?? "Campaña"}` };
}

export default async function CampaignSettingsPage({ params }: PageProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    select: { id: true, name: true, description: true, isPublic: true, bannerImage: true, theme: true, masterId: true },
  });
  if (!campaign) notFound();

  // Solo el máster configura la campaña.
  if (campaign.masterId !== user.id) redirect(`/${campaignSlug}`);

  return (
    <CampaignSettingsForm
      slug={campaignSlug}
      initial={{
        name: campaign.name,
        description: campaign.description ?? "",
        isPublic: campaign.isPublic,
        bannerImage: campaign.bannerImage ?? "",
        theme: campaign.theme,
      }}
    />
  );
}
