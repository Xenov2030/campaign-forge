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

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;

    const aids = await prisma.visualAid.findMany({
      where: {
        campaignId,
        ...(isMaster ? {} : { isPublic: true }),
      },
      include: {
        user: { select: { displayName: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ aids });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { campaignId, name, description, imageUrl, isPublic } = await request.json();

    if (!campaignId || !imageUrl) {
      return NextResponse.json({ error: "campaignId e imageUrl son requeridos" }, { status: 400 });
    }

    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "No eres miembro de esta campaña" }, { status: 403 });

    const aid = await prisma.visualAid.create({
      data: {
        campaignId,
        userId: user.id,
        name: name?.trim() || "Ayuda visual",
        description: description?.trim() || null,
        imageUrl,
        isPublic: isPublic ?? true,
      },
      include: { user: { select: { displayName: true } } },
    });

    return NextResponse.json({ aid }, { status: 201 });
  } catch (error) {
    console.error("Create visual aid error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    const aid = await prisma.visualAid.findUnique({ where: { id } });
    if (!aid) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const campaign = await prisma.campaign.findUnique({ where: { id: aid.campaignId } });
    if (aid.userId !== user.id && campaign?.masterId !== user.id) {
      return NextResponse.json({ error: "No tienes permiso" }, { status: 403 });
    }

    await prisma.visualAid.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
