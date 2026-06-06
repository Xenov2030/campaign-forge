import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { getPusherServer, campaignChannel } from "@/lib/pusher/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { inviteCode } = await request.json();
    if (!inviteCode) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

    const campaign = await prisma.campaign.findFirst({
      where: { inviteCode: { equals: inviteCode.toUpperCase(), mode: "insensitive" } },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Código de invitación inválido" }, { status: 404 });
    }

    if (campaign.masterId === user.id) {
      return NextResponse.json({ slug: campaign.slug });
    }

    const existing = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: campaign.id, userId: user.id } },
    });

    if (!existing) {
      await prisma.campaignMember.create({
        data: { campaignId: campaign.id, userId: user.id, role: "PLAYER" },
      });

      // Notify campaign channel so master sees the new member in real-time
      const pusher = getPusherServer();
      if (pusher) {
        pusher.trigger(campaignChannel(campaign.id), "member-joined", {
          userId: user.id,
          displayName: user.displayName,
        }).catch(() => {});
      }
    }

    return NextResponse.json({ slug: campaign.slug });
  } catch (error) {
    console.error("Join campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
