import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";
import { getPusherServer, userChannel } from "@/lib/pusher/server";

type CampaignLite = { id: string; name: string; slug: string; masterId: string };
type JoinReqLite = { id: string; status: string };

// POST /api/campaigns/join — solicita unirse a una campaña (no une directo).
// Crea una JoinRequest PENDIENTE y notifica al máster (públicas y privadas).
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { inviteCode } = await request.json();
    if (!inviteCode) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

    const campaign = (await prisma.campaign.findFirst({
      where: { inviteCode: { equals: inviteCode.toUpperCase(), mode: "insensitive" } },
      select: { id: true, name: true, slug: true, masterId: true },
    })) as CampaignLite | null;

    if (!campaign) {
      return NextResponse.json({ error: "Código de invitación inválido" }, { status: 404 });
    }
    if (campaign.masterId === user.id) {
      return NextResponse.json({ error: "Sos el máster de esta campaña" }, { status: 400 });
    }

    const existingMember = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId: campaign.id, userId: user.id } },
    });
    if (existingMember) {
      return NextResponse.json({ error: "Ya sos miembro de esta campaña" }, { status: 400 });
    }

    const existing = (await prisma.joinRequest.findUnique({
      where: { campaignId_userId: { campaignId: campaign.id, userId: user.id } },
    })) as JoinReqLite | null;
    if (existing && existing.status === "PENDING") {
      return NextResponse.json({ status: "pending", campaignName: campaign.name });
    }

    const joinReq = (await prisma.joinRequest.upsert({
      where: { campaignId_userId: { campaignId: campaign.id, userId: user.id } },
      create: { campaignId: campaign.id, userId: user.id, status: "PENDING" },
      update: { status: "PENDING" },
    })) as { id: string };

    const notification = await prisma.notification.create({
      data: {
        userId: campaign.masterId,
        type: "JOIN_REQUEST",
        title: "Nueva solicitud de unión",
        body: `${user.displayName} quiere unirse a "${campaign.name}"`,
        link: `/${campaign.slug}`,
        data: {
          joinRequestId: joinReq.id,
          campaignId: campaign.id,
          requesterId: user.id,
          requesterName: user.displayName,
          campaignName: campaign.name,
        },
      },
    });

    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(userChannel(campaign.masterId), "notification", notification).catch(() => {});
    }

    return NextResponse.json({ status: "pending", campaignName: campaign.name });
  } catch (error) {
    console.error("Join request error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
