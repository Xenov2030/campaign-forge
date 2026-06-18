import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { isQuestType, isQuestStatus, sanitizeObjectives, sanitizeRewards } from "@/lib/quests";

// POST /api/quests — crear misión (solo el máster).
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const body = await request.json();
    const { campaignId, name } = body;

    if (!campaignId || !name?.trim()) {
      return NextResponse.json({ error: "campaignId y name son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear misiones" }, { status: 403 });
    }

    const quest = await prisma.quest.create({
      data: {
        campaignId,
        name: name.trim(),
        description: body.description?.trim() || null,
        type: isQuestType(body.type) ? body.type : "MAIN",
        status: isQuestStatus(body.status) ? body.status : "ACTIVE",
        hook: body.hook?.trim() || null,
        notes: body.notes?.trim() || null,
        objectives: sanitizeObjectives(body.objectives),
        rewards: sanitizeRewards(body.rewards),
        isKnownToParty: body.isKnownToParty ?? true,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        tags: Array.isArray(body.tags) ? body.tags : [],
      },
    });

    return NextResponse.json({ quest }, { status: 201 });
  } catch (error) {
    console.error("Create quest error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
