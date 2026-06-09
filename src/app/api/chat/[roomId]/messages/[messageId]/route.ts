import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getPusherServer, chatChannel } from "@/lib/pusher/server";

type MessageOwner = { userId: string; roomId: string };

// PATCH /api/chat/[roomId]/messages/[messageId] — editar (solo el autor)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, messageId } = await params;
    const body = await request.json();
    const content = body.content?.trim();
    if (!content) return NextResponse.json({ error: "content requerido" }, { status: 400 });

    const existing = (await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { userId: true, roomId: true },
    })) as MessageOwner | null;

    if (!existing || existing.roomId !== roomId) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Solo el autor puede editar el mensaje" }, { status: 403 });
    }

    const updated = await prisma.chatMessage.update({
      where: { id: messageId },
      data: { content, editedAt: new Date() },
      include: { user: { select: { id: true, displayName: true, avatarUrl: true } } },
    });

    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(chatChannel(roomId), "message-edited", updated).catch(() => {});
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/chat/[roomId]/messages/[messageId] — borrar (solo el autor)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string; messageId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { roomId, messageId } = await params;

    const existing = (await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: { userId: true, roomId: true },
    })) as MessageOwner | null;

    if (!existing || existing.roomId !== roomId) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 });
    }
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: "Solo el autor puede borrar el mensaje" }, { status: 403 });
    }

    await prisma.chatMessage.delete({ where: { id: messageId } });

    const pusher = getPusherServer();
    if (pusher) {
      pusher.trigger(chatChannel(roomId), "message-deleted", { id: messageId }).catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
