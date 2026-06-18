import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";
import { getPusherServer, campaignChannel } from "@/lib/pusher/server";

type CharOwner = {
  userId: string;
  campaignId: string;
  campaign: { masterId: string };
};

const num = (v: unknown, fallback: number): number => (typeof v === "number" ? v : fallback);
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);

// PATCH /api/characters/[id] — edición rápida (HP/condiciones desde la card)
// o edición completa (desde el formulario). Solo master o dueño.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const character = (await prisma.character.findUnique({
      where: { id },
      select: { userId: true, campaignId: true, campaign: { select: { masterId: true } } },
    })) as CharOwner | null;

    if (!character) return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 });

    const isMaster = character.campaign.masterId === user.id;
    const isOwner = character.userId === user.id;
    if (!isMaster && !isOwner) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const data: Record<string, unknown> = {};

    // Edición rápida (card)
    if (typeof body.hitPoints === "number") data.hitPoints = Math.max(0, Math.round(body.hitPoints));
    if (Array.isArray(body.conditions)) {
      data.conditions = body.conditions.filter((c: unknown): c is string => typeof c === "string");
    }

    // Edición completa (formulario)
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if ("race" in body) data.race = str(body.race);
    if ("className" in body) data.class = str(body.className);
    if ("subclass" in body) data.subclass = str(body.subclass);
    if (typeof body.level === "number") data.level = body.level;
    if ("background" in body) data.background = str(body.background);
    if ("alignment" in body) data.alignment = str(body.alignment);
    if ("appearance" in body) data.appearance = str(body.appearance);
    if ("backstory" in body) data.backstory = str(body.backstory);
    if ("ideals" in body) data.ideals = str(body.ideals);
    if ("portraitUrl" in body) data.portraitUrl = typeof body.portraitUrl === "string" && body.portraitUrl ? body.portraitUrl : null;
    if ("bannerUrl" in body) data.bannerUrl = typeof body.bannerUrl === "string" && body.bannerUrl ? body.bannerUrl : null;
    if (typeof body.maxHitPoints === "number") data.maxHitPoints = body.maxHitPoints;
    if (typeof body.armorClass === "number") data.armorClass = body.armorClass;
    if (typeof body.speed === "number") data.speed = body.speed;
    if (typeof body.isAlive === "boolean") data.isAlive = body.isAlive;
    if (["str", "dex", "con", "int", "wis", "cha"].some((k) => typeof body[k] === "number")) {
      data.stats = {
        STR: num(body.str, 10), DEX: num(body.dex, 10), CON: num(body.con, 10),
        INT: num(body.int, 10), WIS: num(body.wis, 10), CHA: num(body.cha, 10),
      };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    const updated = await prisma.character.update({
      where: { id },
      data,
      select: { id: true, hitPoints: true, maxHitPoints: true, conditions: true },
    });

    const pusher = getPusherServer();
    if (pusher) {
      pusher
        .trigger(campaignChannel(character.campaignId), "character-updated", { characterId: id })
        .catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Character PATCH error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/characters/[id] — borrar personaje (dueño o master).
// El cascade del schema limpia inventario, hechizos y relaciones.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id } = await params;
    const character = (await prisma.character.findUnique({
      where: { id },
      select: { userId: true, campaignId: true, campaign: { select: { masterId: true } } },
    })) as CharOwner | null;

    if (!character) return NextResponse.json({ error: "Personaje no encontrado" }, { status: 404 });

    const isMaster = character.campaign.masterId === user.id;
    const isOwner = character.userId === user.id;
    if (!isMaster && !isOwner) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await prisma.character.delete({ where: { id } });

    const pusher = getPusherServer();
    if (pusher) {
      pusher
        .trigger(campaignChannel(character.campaignId), "character-updated", { characterId: id })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Character DELETE error:", error);
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
