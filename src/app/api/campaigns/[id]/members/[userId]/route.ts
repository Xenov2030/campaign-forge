import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getPusherServer, campaignChannel } from "@/lib/pusher/server";

// DELETE /api/campaigns/[id]/members/[userId]
// El master expulsa a un jugador, o el propio jugador abandona la campaña.
// Borra la membresía + los personajes del jugador en esa campaña.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: campaignId, userId } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { masterId: true },
    });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    const isSelf = userId === user.id;
    if (!isMaster && !isSelf) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    if (userId === campaign.masterId) {
      return NextResponse.json({ error: "No se puede quitar al máster de su propia campaña" }, { status: 400 });
    }

    await prisma.character.deleteMany({ where: { campaignId, userId } });
    await prisma.campaignMember
      .delete({ where: { campaignId_userId: { campaignId, userId } } })
      .catch(() => {});

    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(campaignChannel(campaignId), "member-left", { userId }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Member DELETE error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
