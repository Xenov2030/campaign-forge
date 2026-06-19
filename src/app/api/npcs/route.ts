import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/api-helpers";
import { CreateNpcBody } from "@/lib/api-schemas";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const bodyResult = await parseBody(request, CreateNpcBody);
    if (bodyResult.error) return bodyResult.error;
    const {
      campaignId, name, nickname, race, occupation, age, gender,
      appearance, personality, backstory, motivations,
      secrets, quirks, voiceNotes, portraitUrl,
      isKnownToParty, isAlive, location, faction, tags,
      hitPoints, maxHitPoints,
    } = bodyResult.data;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear NPCs" }, { status: 403 });
    }

    const npc = await prisma.nPC.create({
      data: {
        campaignId,
        name: name.trim(),
        nickname: nickname?.trim() || null,
        race: race?.trim() || null,
        occupation: occupation?.trim() || null,
        age: age?.trim() || null,
        gender: gender?.trim() || null,
        appearance: appearance?.trim() || null,
        personality: personality?.trim() || null,
        backstory: backstory?.trim() || null,
        motivations: motivations?.trim() || null,
        secrets: secrets?.trim() || null,
        quirks: quirks?.trim() || null,
        voiceNotes: voiceNotes?.trim() || null,
        portraitUrl: portraitUrl || null,
        isKnownToParty: isKnownToParty ?? false,
        isAlive: isAlive ?? true,
        hitPoints: typeof hitPoints === "number" ? hitPoints : null,
        maxHitPoints: typeof maxHitPoints === "number" ? maxHitPoints : null,
        location: location?.trim() || null,
        faction: faction?.trim() || null,
        tags: tags ?? [],
      },
    });

    return NextResponse.json({ npc }, { status: 201 });
  } catch (error) {
    console.error("Create NPC error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
