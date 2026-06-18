import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { isQuestType, isQuestStatus, sanitizeObjectives, sanitizeRewards, autoStatusFromObjectives } from "@/lib/quests";

// PATCH /api/quests/[id]
//  - Máster: edita cualquier campo.
//  - Jugador miembro: solo puede actualizar los objetivos (tildar completados) de misiones visibles.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: { campaign: { select: { id: true, masterId: true } } },
    });
    if (!quest) return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });

    const isMaster = quest.campaign.masterId === user.id;
    if (!isMaster) {
      const member = await prisma.campaignMember.findUnique({
        where: { campaignId_userId: { campaignId: quest.campaign.id, userId: user.id } },
      });
      if (!member) return NextResponse.json({ error: "No sos miembro de esta campaña" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, unknown> = {};

    if (isMaster) {
      if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
      if ("description" in body) data.description = body.description?.trim() || null;
      if (isQuestType(body.type)) data.type = body.type;
      if ("hook" in body) data.hook = body.hook?.trim() || null;
      if ("notes" in body) data.notes = body.notes?.trim() || null;
      if ("rewards" in body) data.rewards = sanitizeRewards(body.rewards);
      if (typeof body.isKnownToParty === "boolean") data.isKnownToParty = body.isKnownToParty;
      if (Array.isArray(body.tags)) data.tags = body.tags;
      if ("deadline" in body) data.deadline = body.deadline ? new Date(body.deadline) : null;

      const objs = "objectives" in body ? sanitizeObjectives(body.objectives) : null;
      if (objs) data.objectives = objs;
      // El estado explícito del máster gana; si no se envía, se deriva de los objetivos.
      if (isQuestStatus(body.status)) data.status = body.status;
      else if (objs) data.status = autoStatusFromObjectives(objs, quest.status);
    } else {
      // Jugador: solo objetivos, y la misión debe estar visible para el grupo.
      if (!quest.isKnownToParty) {
        return NextResponse.json({ error: "Esta misión no está disponible" }, { status: 403 });
      }
      if (!("objectives" in body)) {
        return NextResponse.json({ error: "Solo podés actualizar los objetivos" }, { status: 403 });
      }
      const objs = sanitizeObjectives(body.objectives);
      data.objectives = objs;
      data.status = autoStatusFromObjectives(objs, quest.status);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const updated = await prisma.quest.update({ where: { id }, data });
    return NextResponse.json({ quest: updated });
  } catch (error) {
    console.error("Update quest error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}

// DELETE /api/quests/[id] — borrar misión (solo el máster).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const quest = await prisma.quest.findUnique({
      where: { id },
      include: { campaign: { select: { masterId: true } } },
    });
    if (!quest) return NextResponse.json({ error: "Misión no encontrada" }, { status: 404 });
    if (quest.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede borrar misiones" }, { status: 403 });
    }

    await prisma.quest.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete quest error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
