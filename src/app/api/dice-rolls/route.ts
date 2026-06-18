import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    if (!campaignId) return NextResponse.json({ error: "campaignId requerido" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { masterId: true },
    });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    if (!isMaster) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId: user.id } },
      });
      if (!member) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const rolls = await prisma.diceRoll.findMany({
      where: {
        campaignId,
        ...(isMaster ? {} : { isSecret: false }),
      },
      include: { user: { select: { displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ rolls });
  } catch {
    return NextResponse.json({ error: "Error al obtener tiradas" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { campaignId, notation, results, total, modifier = 0, purpose, isSecret = false } = await request.json();
    if (!campaignId || !notation || results === undefined || total === undefined) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { masterId: true },
    });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    if (!isMaster) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId: user.id } },
      });
      if (!member) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    }

    const roll = await prisma.diceRoll.create({
      data: { campaignId, userId: user.id, notation, results, total, modifier, purpose: purpose ?? null, isSecret },
    });

    return NextResponse.json({ roll }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al guardar tirada" }, { status: 500 });
  }
}
