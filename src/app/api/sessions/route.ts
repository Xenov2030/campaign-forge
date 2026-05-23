import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, title, date, summary, notes, status } = await request.json();

    if (!campaignId) return NextResponse.json({ error: "campaignId requerido" }, { status: 400 });

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear sesiones" }, { status: 403 });
    }

    const lastSession = await prisma.session.findFirst({
      where: { campaignId },
      orderBy: { number: "desc" },
    });

    const session = await prisma.session.create({
      data: {
        campaignId,
        masterId: user.id,
        number: (lastSession?.number ?? 0) + 1,
        title: title?.trim() || null,
        date: date ? new Date(date) : null,
        summary: summary?.trim() || null,
        notes: notes?.trim() || null,
        status: status ?? "PLANNED",
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
