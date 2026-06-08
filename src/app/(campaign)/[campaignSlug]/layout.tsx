import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { CampaignSidebar } from "@/components/layout/campaign-sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { DiceTray } from "@/components/dice/dice-tray";
import { MasterAssistant } from "@/components/ai/master-assistant";
import { CampaignRealtime } from "@/components/realtime/campaign-realtime";
import { Toaster } from "sonner";

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
      members: { include: { user: true } },
    },
  });

  if (!campaign) notFound();

  const isMaster = campaign.masterId === user.id;
  const isMember = campaign.members.some((m: { userId: string }) => m.userId === user.id) || isMaster;

  if (!isMember) redirect(`/join/${campaign.inviteCode}`);

  // Auto-initialize default chat rooms for new campaigns
  const [textRooms, voiceRooms] = await Promise.all([
    prisma.chatRoom.findMany({ where: { campaignId: campaign.id, channelType: "TEXT" } }),
    prisma.chatRoom.findMany({
      where: { campaignId: campaign.id, channelType: "VOICE" },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  if (textRooms.length === 0) {
    await prisma.chatRoom.create({
      data: { campaignId: campaign.id, name: "General", channelType: "TEXT", type: "PUBLIC" },
    });
  }
  if (voiceRooms.length === 0) {
    await Promise.all([
      prisma.chatRoom.create({ data: { campaignId: campaign.id, name: "General", channelType: "VOICE", type: "PUBLIC" } }),
      prisma.chatRoom.create({ data: { campaignId: campaign.id, name: "Dungeon", channelType: "VOICE", type: "PUBLIC" } }),
    ]);
  }

  // Fetch final voice rooms (after potential creation)
  const finalVoiceRooms = voiceRooms.length > 0
    ? voiceRooms
    : await prisma.chatRoom.findMany({
        where: { campaignId: campaign.id, channelType: "VOICE" },
        orderBy: { createdAt: "asc" },
      });

  const serializedVoiceRooms = finalVoiceRooms.map((r: { id: string; name: string; type: string }) => ({
    id: r.id,
    name: r.name,
    type: r.type as "PUBLIC" | "PRIVATE" | "MASTER_ONLY",
    channelType: "VOICE" as const,
  }));

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)]" data-theme={campaign.theme.toLowerCase()}>
      <CampaignSidebar
        campaignSlug={campaignSlug}
        campaignId={campaign.id}
        isMaster={isMaster}
        campaignName={campaign.name}
        campaignTheme={campaign.theme}
        voiceRooms={serializedVoiceRooms}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopNav
          campaignName={campaign.name}
          userDisplayName={user.displayName}
          userAvatarUrl={user.avatarUrl ?? undefined}
          isMaster={isMaster}
        />
        <main className="flex-1 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>

      <CampaignRealtime
        campaignId={campaign.id}
        isMaster={isMaster}
        userId={user.id}
      />
      <Toaster position="top-right" richColors />
      <DiceTray isMaster={isMaster} />
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
