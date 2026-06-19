import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/api-helpers";
import { CreateCharacterBody } from "@/lib/api-schemas";
import prisma from "@/lib/prisma";
import { getPusherServer, campaignChannel } from "@/lib/pusher/server";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const bodyResult = await parseBody(request, CreateCharacterBody);
    if (bodyResult.error) return bodyResult.error;
    const {
      campaignId, name, race, className, subclass, level, background,
      alignment, appearance, backstory, ideals, portraitUrl, bannerUrl,
      str, dex, con, int: intel, wis, cha,
      hitPoints, maxHitPoints, armorClass, speed,
    } = bodyResult.data;

    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "No eres miembro de esta campaña" }, { status: 403 });

    // Players can only have one character per campaign
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    if (campaign.masterId !== user.id) {
      const existing = await prisma.character.findFirst({
        where: { campaignId, userId: user.id, isNPC: false },
      });
      if (existing) {
        return NextResponse.json({ error: "Ya tienes un personaje en esta campaña" }, { status: 400 });
      }
    }

    const stats = {
      STR: str ?? 10, DEX: dex ?? 10, CON: con ?? 10,
      INT: intel ?? 10, WIS: wis ?? 10, CHA: cha ?? 10,
    };

    const character = await prisma.character.create({
      data: {
        campaignId,
        userId: user.id,
        name: name.trim(),
        race: race?.trim() || null,
        class: className?.trim() || null,
        subclass: subclass?.trim() || null,
        level: level ?? 1,
        background: background?.trim() || null,
        alignment: alignment?.trim() || null,
        appearance: appearance?.trim() || null,
        backstory: backstory?.trim() || null,
        ideals: ideals?.trim() || null,
        portraitUrl: portraitUrl || null,
        bannerUrl: bannerUrl || null,
        stats,
        hitPoints: hitPoints ?? 10,
        maxHitPoints: maxHitPoints ?? hitPoints ?? 10,
        armorClass: armorClass ?? 10,
        speed: speed ?? 30,
      },
    });

    // Notify campaign so master's characters page refreshes
    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(campaignChannel(campaignId), "character-created", {
        characterId: character.id,
        characterName: character.name,
        userId: user.id,
      }).catch(() => {});
    }

    return NextResponse.json({ character }, { status: 201 });
  } catch (error) {
    console.error("Create character error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
