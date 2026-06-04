import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/chat/rooms?campaignId=xxx
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");
    if (!campaignId) return NextResponse.json({ error: "campaignId requerido" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { members: { select: { userId: true } } },
    });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    const isMember = isMaster || campaign.members.some((m: { userId: string }) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const rooms = await prisma.chatRoom.findMany({
      where: {
        campaignId,
        ...(isMaster ? {} : { type: { not: "MASTER_ONLY" } }),
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/chat/rooms — master creates a new voice channel
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, name, channelType } = await request.json();
    if (!campaignId || !name?.trim()) {
      return NextResponse.json({ error: "campaignId y name son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear canales" }, { status: 403 });
    }

    const room = await prisma.chatRoom.create({
      data: {
        campaignId,
        name: name.trim(),
        channelType: channelType === "TEXT" ? "TEXT" : "VOICE",
        type: "PUBLIC",
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
