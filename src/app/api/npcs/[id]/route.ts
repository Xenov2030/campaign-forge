import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

// Campos de texto editables: si vienen en el body, se recortan (vacío => null).
const TEXT_FIELDS = [
  "nickname", "race", "occupation", "age", "gender",
  "appearance", "personality", "backstory",
  "motivations", "secrets", "quirks", "voiceNotes",
  "location", "faction",
] as const;

async function getOwnedNpc(id: string, userId: string) {
  const npc = await prisma.nPC.findUnique({
    where: { id },
    include: { campaign: { select: { masterId: true, slug: true } } },
  });
  if (!npc) return { error: "NPC no encontrado", status: 404 as const };
  if (npc.campaign.masterId !== userId) return { error: "Solo el máster puede gestionar NPCs", status: 403 as const };
  return { npc };
}

// PATCH /api/npcs/[id] — edición parcial (form completo o toggle de un solo campo).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const owned = await getOwnedNpc(id, user.id);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

    const body = await request.json();
    const data: Record<string, unknown> = {};

    // name nunca se vacía: solo se actualiza si viene con contenido.
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();

    for (const field of TEXT_FIELDS) {
      if (field in body) {
        data[field] = typeof body[field] === "string" && body[field].trim() ? body[field].trim() : null;
      }
    }

    if ("portraitUrl" in body) data.portraitUrl = body.portraitUrl || null;
    if (typeof body.isKnownToParty === "boolean") data.isKnownToParty = body.isKnownToParty;
    if (typeof body.isAlive === "boolean") data.isAlive = body.isAlive;
    if ("hitPoints" in body) data.hitPoints = typeof body.hitPoints === "number" ? body.hitPoints : null;
    if ("maxHitPoints" in body) data.maxHitPoints = typeof body.maxHitPoints === "number" ? body.maxHitPoints : null;
    if (Array.isArray(body.tags)) data.tags = body.tags;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const npc = await prisma.nPC.update({ where: { id }, data });
    return NextResponse.json({ npc });
  } catch (error) {
    console.error("Update NPC error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

// DELETE /api/npcs/[id] — borra el NPC (solo el máster).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const owned = await getOwnedNpc(id, user.id);
    if ("error" in owned) return NextResponse.json({ error: owned.error }, { status: owned.status });

    await prisma.nPC.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete NPC error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
