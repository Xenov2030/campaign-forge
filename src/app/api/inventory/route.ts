import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { characterId, itemId, quantity = 1 } = await request.json();
    if (!characterId || !itemId) {
      return NextResponse.json({ error: "characterId e itemId son requeridos" }, { status: 400 });
    }

    const [item, character] = await Promise.all([
      prisma.item.findUnique({ where: { id: itemId }, select: { name: true, campaignId: true } }),
      prisma.character.findUnique({ where: { id: characterId }, select: { campaignId: true } }),
    ]);

    if (!item) return NextResponse.json({ error: "Objeto no encontrado" }, { status: 404 });
    if (!character) return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 });
    if (item.campaignId !== character.campaignId) {
      return NextResponse.json({ error: "El objeto y el personaje deben ser de la misma campaña" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: item.campaignId },
      select: { masterId: true },
    });
    if (!campaign || campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede asignar objetos" }, { status: 403 });
    }

    const inventoryItem = await prisma.inventoryItem.create({
      data: { characterId, itemId, name: item.name, quantity: Math.max(1, quantity) },
    });

    return NextResponse.json({ inventoryItem }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error al asignar el objeto" }, { status: 500 });
  }
}
