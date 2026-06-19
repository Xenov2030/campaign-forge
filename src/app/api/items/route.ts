import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/api-helpers";
import { CreateItemBody } from "@/lib/api-schemas";
import prisma from "@/lib/prisma";
import { isItemRarity } from "@/lib/items";

// GET /api/items?campaignId=...&tag=... — lista objetos de la campaña (miembros).
// El máster ve todos; el jugador solo los visibles. `tag` filtra por etiqueta (p. ej. recompensas de misión).
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    const tag = searchParams.get("tag");
    if (!campaignId) return NextResponse.json({ error: "campaignId requerido" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { masterId: true } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    if (!isMaster) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId, userId: user.id } },
      });
      if (!member) return NextResponse.json({ error: "No sos miembro de esta campaña" }, { status: 403 });
    }

    const items = await prisma.item.findMany({
      where: {
        campaignId,
        ...(tag ? { tags: { has: tag } } : {}),
        ...(isMaster ? {} : { isKnownToParty: true }),
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, rarity: true, type: true },
    });
    return NextResponse.json({ items });
  } catch (error) {
    console.error("List items error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/items — crear objeto (solo máster).
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const bodyResult = await parseBody(request, CreateItemBody);
    if (bodyResult.error) return bodyResult.error;
    const body = bodyResult.data;
    const { campaignId, name } = body;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear objetos" }, { status: 403 });
    }

    const item = await prisma.item.create({
      data: {
        campaignId,
        name: name.trim(),
        type: body.type?.trim() || null,
        rarity: isItemRarity(body.rarity) ? body.rarity : "COMMON",
        description: body.description?.trim() || null,
        lore: body.lore?.trim() || null,
        isArtifact: !!body.isArtifact,
        requiresAttunement: !!body.requiresAttunement,
        isKnownToParty: body.isKnownToParty ?? false,
        imageUrl: body.imageUrl || null,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Create item error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
