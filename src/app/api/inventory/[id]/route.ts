import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { id },
      include: { character: { select: { userId: true, campaignId: true } } },
    });
    if (!inventoryItem) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const campaign = await prisma.campaign.findUnique({
      where: { id: inventoryItem.character.campaignId },
      select: { masterId: true },
    });
    const isMaster = campaign?.masterId === user.id;
    const isOwner = inventoryItem.character.userId === user.id;

    if (!isMaster && !isOwner) {
      return NextResponse.json({ error: "Sin permisos para eliminar este ítem" }, { status: 403 });
    }

    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error al eliminar el objeto del inventario" }, { status: 500 });
  }
}
