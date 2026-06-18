import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

// POST /api/npcs/import  body { campaignId, vaultNpcIds: string[] }
// Copia entradas del baúl como NPCs nuevos en la campaña (solo el máster).
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { campaignId, vaultNpcIds } = await request.json();
    if (!campaignId || !Array.isArray(vaultNpcIds) || vaultNpcIds.length === 0) {
      return NextResponse.json({ error: "campaignId y vaultNpcIds son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede importar NPCs" }, { status: 403 });
    }

    // Solo entradas del propio baúl.
    const entries = await prisma.vaultNpc.findMany({
      where: { id: { in: vaultNpcIds }, userId: user.id },
    });
    if (entries.length === 0) {
      return NextResponse.json({ error: "No hay NPCs válidos para importar" }, { status: 400 });
    }

    type VaultRow = (typeof entries)[number];
    const data = entries.map((e: VaultRow) => ({
      campaignId,
      vaultNpcId: e.id,
      name: e.name,
      nickname: e.nickname,
      race: e.race,
      occupation: e.occupation,
      age: e.age,
      gender: e.gender,
      appearance: e.appearance,
      personality: e.personality,
      backstory: e.backstory,
      motivations: e.motivations,
      secrets: e.secrets,
      quirks: e.quirks,
      voiceNotes: e.voiceNotes,
      portraitUrl: e.portraitUrl,
      hitPoints: e.hitPoints,
      maxHitPoints: e.maxHitPoints,
      location: e.location,
      faction: e.faction,
      stats: (e.stats ?? {}) as Prisma.InputJsonValue,
      tags: e.tags,
      isKnownToParty: false,
      isAlive: true,
    }));

    await prisma.nPC.createMany({ data });
    return NextResponse.json({ count: data.length }, { status: 201 });
  } catch (error) {
    console.error("Import NPC error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
