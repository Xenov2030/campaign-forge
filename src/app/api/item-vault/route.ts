import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

// GET /api/item-vault — lista objetos del baúl del usuario.
export async function GET() {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const vault = await prisma.vaultItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ vault });
  } catch (error) {
    console.error("Item vault list error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/item-vault  body { itemId } — guarda un objeto de campaña en el baúl.
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { itemId } = await request.json() as { itemId?: string };
    if (!itemId) return NextResponse.json({ error: "itemId requerido" }, { status: 400 });

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { campaign: { select: { masterId: true } } },
    });
    if (!item) return NextResponse.json({ error: "Objeto no encontrado" }, { status: 404 });
    if (item.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede guardar objetos en el baúl" }, { status: 403 });
    }

    // Prevenir duplicados por nombre
    const existing = await prisma.vaultItem.findFirst({
      where: { userId: user.id, name: item.name },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya tenés este objeto en el baúl" }, { status: 409 });
    }

    const entry = await prisma.vaultItem.create({
      data: {
        userId: user.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        description: item.description,
        lore: item.lore,
        imageUrl: item.imageUrl,
        isArtifact: item.isArtifact,
        requiresAttunement: item.requiresAttunement,
        tags: item.tags,
      },
    });

    return NextResponse.json({ vaultItem: entry }, { status: 201 });
  } catch (error) {
    console.error("Item vault save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
