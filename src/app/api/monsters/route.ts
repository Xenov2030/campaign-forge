import { NextRequest, NextResponse } from "next/server";
import { requireAuth, parseBody } from "@/lib/api-helpers";
import { CreateMonsterBody } from "@/lib/api-schemas";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const campaignId = request.nextUrl.searchParams.get("campaignId");
    if (!campaignId) return NextResponse.json({ error: "campaignId requerido" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: { select: { userId: true } } },
    });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });

    const isMember = campaign.masterId === user.id || campaign.members.some((m: { userId: string }) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const monsters = await prisma.monster.findMany({
      where: { campaignId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, type: true, size: true, alignment: true,
        challengeRating: true, hitPoints: true, armorClass: true, tags: true,
        imageUrl: true, createdAt: true,
      },
    });

    return NextResponse.json({ monsters });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const bodyResult = await parseBody(request, CreateMonsterBody);
    if (bodyResult.error) return bodyResult.error;
    const body = bodyResult.data;
    const { campaignId, name } = body;

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear monstruos" }, { status: 403 });
    }

    const monster = await prisma.monster.create({
      data: {
        campaignId,
        name: name.trim(),
        type: typeof body.type === "string" ? body.type : null,
        size: typeof body.size === "string" ? body.size : null,
        alignment: typeof body.alignment === "string" ? body.alignment : null,
        challengeRating: typeof body.challengeRating === "string" ? body.challengeRating : null,
        hitPoints: typeof body.hitPoints === "string" ? body.hitPoints : null,
        armorClass: typeof body.armorClass === "number" ? body.armorClass : null,
        speed: (body.speed as object) ?? {},
        stats: (body.stats as object) ?? {},
        skills: (body.skills as object) ?? {},
        senses: (body.senses as object) ?? {},
        languages: typeof body.languages === "string" ? body.languages : null,
        abilities: (body.abilities as unknown[]) ?? [],
        actions: (body.actions as unknown[]) ?? [],
        reactions: (body.reactions as unknown[]) ?? [],
        legendaryActions: (body.legendaryActions as unknown[]) ?? [],
        lore: typeof body.lore === "string" ? body.lore : null,
        imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
        tags: Array.isArray(body.tags) ? (body.tags as string[]) : [],
      },
    });

    return NextResponse.json({ monster }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
