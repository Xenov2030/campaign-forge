import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    include: { campaign: { select: { masterId: true, slug: true, members: { select: { userId: true } } } } },
  });
  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember =
    session.campaign.masterId === user.id ||
    session.campaign.members.some((m: { userId: string }) => m.userId === user.id);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(session);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    select: { campaign: { select: { masterId: true } }, masterId: true },
  });
  if (!session || session.campaign.masterId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { title, date, time, duration, summary, notes, status, isPresential, attendeeIds, recap } = body;

  const data: Record<string, unknown> = {};
  if ("title" in body) data.title = title?.trim() || null;
  if ("date" in body || "time" in body) {
    if (date) {
      const timeStr = time || "00:00";
      data.date = new Date(`${date}T${timeStr}:00`);
    } else {
      data.date = null;
    }
  }
  if ("duration" in body) data.duration = typeof duration === "number" ? duration : null;
  if ("summary" in body) data.summary = summary?.trim() || null;
  if ("notes" in body) data.notes = notes?.trim() || null;
  if ("recap" in body) data.recap = recap?.trim() || null;
  if ("status" in body) data.status = status;
  if ("isPresential" in body) data.isPresential = isPresential;
  if ("attendeeIds" in body) data.attendeeIds = Array.isArray(attendeeIds) ? attendeeIds : [];

  const updated = await prisma.session.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const session = await prisma.session.findUnique({
    where: { id },
    select: { campaign: { select: { masterId: true } } },
  });
  if (!session || session.campaign.masterId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
