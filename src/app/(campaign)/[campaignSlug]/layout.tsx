import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { CampaignSidebar } from "@/components/layout/campaign-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { DiceTray } from "@/components/dice/dice-tray";
import { MasterAssistant } from "@/components/ai/master-assistant";

interface CampaignLayoutProps {
  children: React.ReactNode;
  params: Promise<{ campaignSlug: string }>;
}

export default async function CampaignLayout({ children, params }: CampaignLayoutProps) {
  const { campaignSlug } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const campaign = await prisma.campaign.findUnique({
    where: { slug: campaignSlug },
    include: {
      master: true,
      members: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const isMember = campaign.members.some((m: { userId: string }) => m.userId === user.id) || isMaster;

  if (!isMember) {
    redirect(`/join/${campaign.inviteCode}`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]" data-theme={campaign.theme.toLowerCase()}>
      <CampaignSidebar
        campaignSlug={campaignSlug}
        isMaster={isMaster}
        campaignName={campaign.name}
        campaignTheme={campaign.theme}
        userDisplayName={user.displayName}
        userAvatarUrl={user.avatarUrl ?? undefined}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          campaignName={campaign.name}
          userDisplayName={user.displayName}
          userAvatarUrl={user.avatarUrl ?? undefined}
          isMaster={isMaster}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating panels */}
      <DiceTray />
      {isMaster && (
        <MasterAssistant
          campaignId={campaign.id}
          campaignName={campaign.name}
          campaignTheme={campaign.theme}
        />
      )}
    </div>
  );
}
