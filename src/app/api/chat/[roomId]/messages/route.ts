import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getPusherServer, chatChannel } from "@/lib/pusher/server";

type CampaignAccess = { masterId: string; members: { userId: string }[] };

// GET /api/chat/[roomId]/messages?limit=50&before=cursor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
    const before = searchParams.get("before");

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { campaign: { include: { members: { select: { userId: true } } } } },
    });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const campaign = room.campaign as CampaignAccess;
    const isMaster = campaign.masterId === user.id;
    const isMember = isMaster || campaign.members.some((m) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (room.type === "MASTER_ONLY" && !isMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    // Filter out master-only dice rolls for non-master users
    const filtered = isMaster
      ? messages.reverse()
      : messages.filter(
          (m: { metadata?: Record<string, unknown> | null }) => !m.metadata?.masterOnly
        ).reverse();
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/chat/[roomId]/messages
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId } = await params;
    const body = await request.json();
    const content = body.content?.trim();
    if (!content) return NextResponse.json({ error: "content requerido" }, { status: 400 });

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { campaign: { include: { members: { select: { userId: true } } } } },
    });
    if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    const campaign = room.campaign as CampaignAccess;
    const isMaster = campaign.masterId === user.id;
    const isMember = isMaster || campaign.members.some((m) => m.userId === user.id);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (room.type === "MASTER_ONLY" && !isMaster) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messageType = body.type === "DICE_ROLL" ? "DICE_ROLL" : "TEXT";
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};

    const message = await prisma.chatMessage.create({
      data: { roomId, userId: user.id, content, type: messageType, metadata },
      include: {
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    // Broadcast to Pusher subscribers (fire-and-forget, non-blocking)
    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(chatChannel(roomId), "new-message", message).catch(() => {});
    }

    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
