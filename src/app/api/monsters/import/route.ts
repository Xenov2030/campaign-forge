import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// POST /api/monsters/import  body { campaignId, vaultMonsterIds: string[] }
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, vaultMonsterIds } = await request.json() as { campaignId?: string; vaultMonsterIds?: string[] };
    if (!campaignId || !Array.isArray(vaultMonsterIds) || vaultMonsterIds.length === 0) {
      return NextResponse.json({ error: "campaignId y vaultMonsterIds son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede importar criaturas" }, { status: 403 });
    }

    const entries = await prisma.vaultMonster.findMany({
      where: { id: { in: vaultMonsterIds }, userId: user.id },
    });
    if (entries.length === 0) {
      return NextResponse.json({ error: "No hay criaturas válidas para importar" }, { status: 400 });
    }

    type VaultRow = (typeof entries)[number];
    const data = entries.map((e: VaultRow) => ({
      campaignId,
      name: e.name,
      type: e.type,
      size: e.size,
      alignment: e.alignment,
      challengeRating: e.challengeRating,
      hitPoints: e.hitPoints,
      armorClass: e.armorClass,
      speed: (e.speed ?? {}) as Prisma.InputJsonValue,
      stats: (e.stats ?? {}) as Prisma.InputJsonValue,
      skills: (e.skills ?? {}) as Prisma.InputJsonValue,
      senses: (e.senses ?? {}) as Prisma.InputJsonValue,
      languages: e.languages,
      abilities: (e.abilities ?? []) as Prisma.InputJsonValue,
      actions: (e.actions ?? []) as Prisma.InputJsonValue,
      reactions: (e.reactions ?? []) as Prisma.InputJsonValue,
      legendaryActions: (e.legendaryActions ?? []) as Prisma.InputJsonValue,
      lore: e.lore,
      imageUrl: e.imageUrl,
      tags: e.tags,
    }));

    await prisma.monster.createMany({ data });
    return NextResponse.json({ count: data.length }, { status: 201 });
  } catch (error) {
    console.error("Import monster error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
