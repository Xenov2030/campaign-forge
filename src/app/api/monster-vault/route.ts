import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

function vaultDataFromMonster(m: Record<string, unknown>) {
  return {
    name: m.name as string,
    type: (m.type as string | null) ?? null,
    size: (m.size as string | null) ?? null,
    alignment: (m.alignment as string | null) ?? null,
    challengeRating: (m.challengeRating as string | null) ?? null,
    hitPoints: (m.hitPoints as string | null) ?? null,
    armorClass: (m.armorClass as number | null) ?? null,
    speed: (m.speed ?? {}) as Prisma.InputJsonValue,
    stats: (m.stats ?? {}) as Prisma.InputJsonValue,
    skills: (m.skills ?? {}) as Prisma.InputJsonValue,
    senses: (m.senses ?? {}) as Prisma.InputJsonValue,
    languages: (m.languages as string | null) ?? null,
    abilities: (m.abilities ?? []) as Prisma.InputJsonValue,
    actions: (m.actions ?? []) as Prisma.InputJsonValue,
    reactions: (m.reactions ?? []) as Prisma.InputJsonValue,
    legendaryActions: (m.legendaryActions ?? []) as Prisma.InputJsonValue,
    lore: (m.lore as string | null) ?? null,
    imageUrl: (m.imageUrl as string | null) ?? null,
    tags: Array.isArray(m.tags) ? (m.tags as string[]) : [],
  };
}

// GET /api/monster-vault — lista criaturas del baúl del usuario.
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vault = await prisma.vaultMonster.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ vault });
  } catch (error) {
    console.error("Monster vault list error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/monster-vault  body { monsterId } — guarda un monstruo de campaña en el baúl.
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { monsterId } = await request.json() as { monsterId?: string };
    if (!monsterId) return NextResponse.json({ error: "monsterId requerido" }, { status: 400 });

    const monster = await prisma.monster.findUnique({
      where: { id: monsterId },
      include: { campaign: { select: { masterId: true } } },
    });
    if (!monster) return NextResponse.json({ error: "Monstruo no encontrado" }, { status: 404 });
    if (monster.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede guardar criaturas en el baúl" }, { status: 403 });
    }

    const entry = await prisma.vaultMonster.create({
      data: { userId: user.id, ...vaultDataFromMonster(monster as unknown as Record<string, unknown>) },
    });

    return NextResponse.json({ vaultMonster: entry }, { status: 201 });
  } catch (error) {
    console.error("Monster vault save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
