import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/notifications — notificaciones del usuario (recientes primero) + no leídas.
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    // Las solicitudes de unión ya respondidas (aceptadas/rechazadas) no deben seguir
    // apareciendo: cruzamos con el estado real de la JoinRequest y dejamos solo las PENDING.
    const reqIds = notifications
      .filter((n: { type: string }) => n.type === "JOIN_REQUEST")
      .map((n: { data: unknown }) => (n.data as { joinRequestId?: string } | null)?.joinRequestId)
      .filter((id: string | undefined): id is string => Boolean(id));

    let pendingIds = new Set<string>();
    if (reqIds.length > 0) {
      const pending = await prisma.joinRequest.findMany({
        where: { id: { in: reqIds }, status: "PENDING" },
        select: { id: true },
      });
      pendingIds = new Set(pending.map((r: { id: string }) => r.id));
    }

    const visible = notifications.filter((n: { type: string; data: unknown }) => {
      if (n.type !== "JOIN_REQUEST") return true;
      const id = (n.data as { joinRequestId?: string } | null)?.joinRequestId;
      return id ? pendingIds.has(id) : true;
    });

    const unread = visible.filter((n: { read: boolean }) => !n.read).length;

    return NextResponse.json({ notifications: visible, unread });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/notifications — marca todas las del usuario como leídas.
export async function POST() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
