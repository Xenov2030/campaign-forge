import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getPusherServer, userChannel, campaignChannel } from "@/lib/pusher/server";

type JoinReqFull = {
  id: string;
  userId: string;
  status: string;
  campaign: { id: string; name: string; slug: string; masterId: string };
  user: { displayName: string };
};

// POST /api/join-requests/[id]  body: { action: "accept" | "reject" }  (solo el máster)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { action } = await request.json();
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    }

    const jr = (await prisma.joinRequest.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, name: true, slug: true, masterId: true } },
        user: { select: { displayName: true } },
      },
    })) as JoinReqFull | null;

    if (!jr) return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
    if (jr.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede responder" }, { status: 403 });
    }
    if (jr.status !== "PENDING") {
      return NextResponse.json({ error: "Esta solicitud ya fue respondida" }, { status: 400 });
    }

    const pusher = getPusherServer();

    if (action === "accept") {
      await prisma.campaignMember.upsert({
        where: { campaignId_userId: { campaignId: jr.campaign.id, userId: jr.userId } },
        create: { campaignId: jr.campaign.id, userId: jr.userId, role: "PLAYER" },
        update: {},
      });
      await prisma.joinRequest.update({ where: { id }, data: { status: "ACCEPTED" } });
      const notif = await prisma.notification.create({
        data: {
          userId: jr.userId,
          type: "JOIN_ACCEPTED",
          title: "Solicitud aceptada",
          body: `Te uniste a "${jr.campaign.name}". ¡Crea tu personaje!`,
          link: `/${jr.campaign.slug}`,
          data: { campaignId: jr.campaign.id, campaignSlug: jr.campaign.slug },
        },
      });
      if (pusher) {
        pusher.trigger(userChannel(jr.userId), "notification", notif).catch(() => {});
        pusher
          .trigger(campaignChannel(jr.campaign.id), "member-joined", {
            userId: jr.userId,
            displayName: jr.user.displayName,
          })
          .catch(() => {});
      }
    } else {
      await prisma.joinRequest.update({ where: { id }, data: { status: "REJECTED" } });
      const notif = await prisma.notification.create({
        data: {
          userId: jr.userId,
          type: "JOIN_REJECTED",
          title: "Solicitud rechazada",
          body: `Tu solicitud para unirte a "${jr.campaign.name}" fue rechazada.`,
          data: { campaignId: jr.campaign.id },
        },
      });
      if (pusher) pusher.trigger(userChannel(jr.userId), "notification", notif).catch(() => {});
    }

    // La solicitud ya fue respondida: quitamos la notificación de la campana del máster.
    // Best-effort: si el filtro JSON fallara, el GET igual filtra las respondidas.
    try {
      await prisma.notification.deleteMany({
        where: {
          userId: jr.campaign.masterId,
          type: "JOIN_REQUEST",
          data: { path: ["joinRequestId"], equals: id },
        },
      });
    } catch (e) {
      console.error("No se pudo borrar la notificación de solicitud:", e);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Join request action error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
