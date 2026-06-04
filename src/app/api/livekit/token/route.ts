import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

// POST /api/livekit/token
// body: { roomName: string }
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "LiveKit no configurado. Completá las variables LIVEKIT_* en .env.local" },
        { status: 503 }
      );
    }

    const { roomName } = await request.json();
    if (!roomName) return NextResponse.json({ error: "roomName requerido" }, { status: 400 });

    // Dynamic import to avoid issues when package is not installed
    const { AccessToken } = await import("livekit-server-sdk");

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.displayName,
      ttl: "4h",
    });
    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    const token = await at.toJwt();

    return NextResponse.json({ token, wsUrl });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
