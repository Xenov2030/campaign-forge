import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import type { VaultItem } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, vaultItemIds } = await request.json() as {
      campaignId?: string;
      vaultItemIds?: string[];
    };

    if (!campaignId || !Array.isArray(vaultItemIds) || vaultItemIds.length === 0) {
      return NextResponse.json({ error: "campaignId y vaultItemIds son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { masterId: true },
    });
    if (!campaign || campaign.masterId !== user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const vaultItems = await prisma.vaultItem.findMany({
      where: { id: { in: vaultItemIds }, userId: user.id },
    });

    if (vaultItems.length === 0) {
      return NextResponse.json({ error: "No se encontraron objetos del baúl" }, { status: 404 });
    }

    await prisma.item.createMany({
      data: vaultItems.map((v: VaultItem) => ({
        campaignId,
        name: v.name,
        type: v.type,
        rarity: v.rarity as "COMMON" | "UNCOMMON" | "RARE" | "VERY_RARE" | "LEGENDARY" | "ARTIFACT",
        description: v.description,
        lore: v.lore,
        imageUrl: v.imageUrl,
        isArtifact: v.isArtifact,
        requiresAttunement: v.requiresAttunement,
        tags: v.tags,
        isKnownToParty: false,
      })),
    });

    return NextResponse.json({ count: vaultItems.length }, { status: 201 });
  } catch (error) {
    console.error("Items import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
