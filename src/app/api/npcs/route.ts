import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      campaignId, name, race, occupation, age, gender,
      appearance, personality, backstory, motivations,
      secrets, quirks, voiceNotes, portraitUrl,
      isKnownToParty, isAlive, location, faction, tags,
    } = body;

    if (!campaignId || !name?.trim()) {
      return NextResponse.json({ error: "campaignId y name son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear PNJs" }, { status: 403 });
    }

    const npc = await prisma.nPC.create({
      data: {
        campaignId,
        name: name.trim(),
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
