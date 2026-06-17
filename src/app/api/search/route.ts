import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const campaignId = searchParams.get("campaignId") ?? "";

  if (q.length < 2 || !campaignId) {
    return NextResponse.json({ characters: [], npcs: [], items: [], quests: [], lore: [] });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { masterId: true },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMaster = campaign.masterId === user.id;
  if (!isMaster) {
    const member = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: user.id } },
    });
    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const visibilityFilter = isMaster ? {} : { isKnownToParty: true };

  const [characters, npcs, items, quests, lore] = await Promise.all([
    prisma.character.findMany({
      where: { campaignId, name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, portraitUrl: true, class: true, level: true },
      take: 5,
    }),
    prisma.nPC.findMany({
      where: { campaignId, name: { contains: q, mode: "insensitive" }, ...visibilityFilter },
      select: { id: true, name: true, portraitUrl: true, race: true },
      take: 5,
    }),
    prisma.item.findMany({
      where: { campaignId, name: { contains: q, mode: "insensitive" }, ...visibilityFilter },
      select: { id: true, name: true, imageUrl: true, rarity: true },
      take: 5,
    }),
    prisma.quest.findMany({
      where: { campaignId, name: { contains: q, mode: "insensitive" }, ...visibilityFilter },
      select: { id: true, name: true, type: true, status: true },
      take: 5,
    }),
    prisma.loreEntry.findMany({
      where: {
        campaignId,
        title: { contains: q, mode: "insensitive" },
        ...(isMaster ? {} : { isPublic: true }),
      },
      select: { id: true, title: true, category: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ characters, npcs, items, quests, lore });
}
