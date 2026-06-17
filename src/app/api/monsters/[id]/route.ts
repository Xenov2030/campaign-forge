import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const monster = await prisma.monster.findUnique({
      where: { id },
      include: { campaign: { include: { members: { select: { userId: true } } } } },
    });
    if (!monster) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const { campaign } = monster;
    const isMember = campaign.masterId === user.id || campaign.members.some((m: { userId: string }) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    return NextResponse.json({ monster });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const monster = await prisma.monster.findUnique({
      where: { id },
      include: { campaign: true },
    });
    if (!monster) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (monster.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede editar" }, { status: 403 });
    }

    const body = await request.json() as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if ("type" in body) data.type = typeof body.type === "string" ? body.type : null;
    if ("size" in body) data.size = typeof body.size === "string" ? body.size : null;
    if ("alignment" in body) data.alignment = typeof body.alignment === "string" ? body.alignment : null;
    if ("challengeRating" in body) data.challengeRating = typeof body.challengeRating === "string" ? body.challengeRating : null;
    if ("hitPoints" in body) data.hitPoints = typeof body.hitPoints === "string" ? body.hitPoints : null;
    if ("armorClass" in body) data.armorClass = typeof body.armorClass === "number" ? body.armorClass : null;
    if ("speed" in body) data.speed = body.speed ?? {};
    if ("stats" in body) data.stats = body.stats ?? {};
    if ("skills" in body) data.skills = body.skills ?? {};
    if ("senses" in body) data.senses = body.senses ?? {};
    if ("languages" in body) data.languages = typeof body.languages === "string" ? body.languages : null;
    if ("abilities" in body) data.abilities = Array.isArray(body.abilities) ? body.abilities : [];
    if ("actions" in body) data.actions = Array.isArray(body.actions) ? body.actions : [];
    if ("reactions" in body) data.reactions = Array.isArray(body.reactions) ? body.reactions : [];
    if ("legendaryActions" in body) data.legendaryActions = Array.isArray(body.legendaryActions) ? body.legendaryActions : [];
    if ("lore" in body) data.lore = typeof body.lore === "string" ? body.lore : null;
    if ("imageUrl" in body) data.imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : null;
    if (Array.isArray(body.tags)) data.tags = body.tags as string[];

    const updated = await prisma.monster.update({ where: { id }, data });
    return NextResponse.json({ monster: updated });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { id } = await params;
    const monster = await prisma.monster.findUnique({
      where: { id },
      include: { campaign: true },
    });
    if (!monster) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    if (monster.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede eliminar" }, { status: 403 });
    }

    await prisma.monster.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
