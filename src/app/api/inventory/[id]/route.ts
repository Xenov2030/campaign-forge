import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

async function resolvePermissions(id: string, userId: string) {
  const inventoryItem = await prisma.inventoryItem.findUnique({
    where: { id },
    include: { character: { select: { userId: true, campaignId: true } } },
  });
  if (!inventoryItem) return null;

  const campaign = await prisma.campaign.findUnique({
    where: { id: inventoryItem.character.campaignId },
    select: { masterId: true },
  });

  return {
    inventoryItem,
    isMaster: campaign?.masterId === userId,
    isOwner: inventoryItem.character.userId === userId,
  };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const resolved = await resolvePermissions(id, user.id);
    if (!resolved) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (!resolved.isMaster && !resolved.isOwner) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 });
    }

    const body = await req.json();
    const data: { isEquipped?: boolean; quantity?: number } = {};
    if (typeof body.isEquipped === "boolean") data.isEquipped = body.isEquipped;
    if (typeof body.quantity === "number") data.quantity = Math.max(1, body.quantity);

    const updated = await prisma.inventoryItem.update({ where: { id }, data });
    return NextResponse.json({ inventoryItem: updated });
  } catch {
    return NextResponse.json({ error: "Error al actualizar el objeto" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const resolved = await resolvePermissions(id, user.id);
    if (!resolved) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (!resolved.isMaster && !resolved.isOwner) {
      return NextResponse.json({ error: "Sin permisos para eliminar este ítem" }, { status: 403 });
    }

    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar el objeto del inventario" }, { status: 500 });
  }
}
