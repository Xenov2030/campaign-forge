import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/sessions?campaignId=xxx
export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const campaignId = request.nextUrl.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { masterId: true, members: { select: { userId: true } } },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember =
    campaign.masterId === user.id ||
    campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sessions = await prisma.session.findMany({
    where: { campaignId },
    orderBy: [{ date: "desc" }, { number: "desc" }],
    select: {
      id: true, number: true, title: true, date: true, status: true,
      isPresential: true, duration: true, attendeeIds: true, summary: true,
    },
  });

  return NextResponse.json(sessions);
}

// POST /api/sessions
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { campaignId, title, date, time, duration, summary, notes, status, isPresential, attendeeIds } = body;

  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { masterId: true, members: { select: { userId: true } } },
  });
  if (!campaign || campaign.masterId !== user.id) {
    return NextResponse.json({ error: "Solo el máster puede crear sesiones" }, { status: 403 });
  }

  const last = await prisma.session.findFirst({
    where: { campaignId },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const number = (last?.number ?? 0) + 1;

  let sessionDate: Date | null = null;
  if (date) {
    const timeStr = time || "00:00";
    sessionDate = new Date(`${date}T${timeStr}:00`);
  }

  const safeAttendeeIds = Array.isArray(attendeeIds) ? attendeeIds : [];

  const session = await prisma.session.create({
    data: {
      campaignId,
      masterId: user.id,
      number,
      title: title?.trim() || null,
      date: sessionDate,
      duration: typeof duration === "number" ? duration : null,
      summary: summary?.trim() || null,
      notes: notes?.trim() || null,
      status: status ?? "PLANNED",
      isPresential: isPresential ?? true,
      attendeeIds: safeAttendeeIds,
    },
  });

  // Notificar a los asistentes seleccionados (excepto el máster)
  if (safeAttendeeIds.length > 0 && (status === "PLANNED" || !status)) {
    const targets = safeAttendeeIds.filter((id: string) => id !== user.id);
    if (targets.length > 0) {
      const dateLabel = sessionDate
        ? sessionDate.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
        : "próximamente";
      await prisma.notification.createMany({
        data: targets.map((userId: string) => ({
          userId,
          type: "SESSION_SCHEDULED" as const,
          title: `Sesión ${number} programada`,
          body: `${title?.trim() ? `"${title.trim()}" — ` : ""}${dateLabel}${isPresential === false ? " (online)" : ""}`,
          link: `#`,
          data: { sessionId: session.id, campaignId },
        })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json(session, { status: 201 });
}
