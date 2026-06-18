import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { getPusherServer, chatChannel } from "@/lib/pusher/server";

// POST /api/chat/[roomId]/typing — avisa que el usuario está escribiendo.
// Fire-and-forget: el cliente lo llama con throttle mientras tipea.
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { roomId } = await params;
    const pusher = getPusherServer();
    if (pusher) {
      pusher
        .trigger(chatChannel(roomId), "user-typing", {
          userId: user.id,
          displayName: user.displayName,
        })
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
