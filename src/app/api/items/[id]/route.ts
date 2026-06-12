import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { isItemRarity } from "@/lib/items";

const TEXT_FIELDS = ["type", "description", "lore"] as const;

async function getOwnedItem(id: string, userId: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });
  if (!item) return { error: "Objeto no encontrado", status: 404 as const };
  if (item.campaign.masterId !== userId) return { error: "Solo el máster puede gestionar objetos", status: 403 as const };
  return { item };
}

// PATCH /api/items/[id] — edición parcial (form completo o toggle de un campo). Solo máster.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const owned = await getOwnedItem(id, user.id);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    for (const field of TEXT_FIELDS) {
      if (field in body) data[field] = typeof body[field] === "string" && body[field].trim() ? body[field].trim() : null;
    }
    if (isItemRarity(body.rarity)) data.rarity = body.rarity;
    if ("imageUrl" in body) data.imageUrl = body.imageUrl || null;
    if (typeof body.isArtifact === "boolean") data.isArtifact = body.isArtifact;
    if (typeof body.requiresAttunement === "boolean") data.requiresAttunement = body.requiresAttunement;
    if (typeof body.isKnownToParty === "boolean") data.isKnownToParty = body.isKnownToParty;
    if (Array.isArray(body.tags)) data.tags = body.tags;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const item = await prisma.item.update({ where: { id }, data });
    return NextResponse.json({ item });
  } catch (error) {
    console.error("Update item error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] — borrar objeto (solo máster).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const owned = await getOwnedItem(id, user.id);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
