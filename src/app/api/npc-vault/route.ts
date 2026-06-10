import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// Campos narrativos que se copian entre NPC y entrada del baúl.
function vaultDataFromNpc(npc: Record<string, unknown>) {
  return {
    name: npc.name as string,
    nickname: (npc.nickname as string | null) ?? null,
    race: (npc.race as string | null) ?? null,
    occupation: (npc.occupation as string | null) ?? null,
    age: (npc.age as string | null) ?? null,
    gender: (npc.gender as string | null) ?? null,
    appearance: (npc.appearance as string | null) ?? null,
    personality: (npc.personality as string | null) ?? null,
    backstory: (npc.backstory as string | null) ?? null,
    motivations: (npc.motivations as string | null) ?? null,
    secrets: (npc.secrets as string | null) ?? null,
    quirks: (npc.quirks as string | null) ?? null,
    voiceNotes: (npc.voiceNotes as string | null) ?? null,
    portraitUrl: (npc.portraitUrl as string | null) ?? null,
    hitPoints: (npc.hitPoints as number | null) ?? null,
    maxHitPoints: (npc.maxHitPoints as number | null) ?? null,
    location: (npc.location as string | null) ?? null,
    faction: (npc.faction as string | null) ?? null,
    stats: (npc.stats ?? {}) as Prisma.InputJsonValue,
    tags: Array.isArray(npc.tags) ? (npc.tags as string[]) : [],
  };
}

// GET /api/npc-vault — lista el baúl del usuario.
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vault = await prisma.vaultNpc.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ vault });
  } catch (error) {
    console.error("Vault list error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/npc-vault  body { npcId } — guarda un NPC de campaña en el baúl.
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { npcId } = await request.json();
    if (!npcId) return NextResponse.json({ error: "npcId requerido" }, { status: 400 });

    const npc = await prisma.nPC.findUnique({
      where: { id: npcId },
      include: { campaign: { select: { masterId: true } } },
    });
    if (!npc) return NextResponse.json({ error: "NPC no encontrado" }, { status: 404 });
    if (npc.campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede guardar NPCs en el baúl" }, { status: 403 });
    }

    // Snapshot independiente: cada guardado crea una copia nueva del estado actual.
    const entry = await prisma.vaultNpc.create({
      data: { userId: user.id, ...vaultDataFromNpc(npc as unknown as Record<string, unknown>) },
    });

    return NextResponse.json({ vaultNpc: entry }, { status: 201 });
  } catch (error) {
    console.error("Vault save error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
