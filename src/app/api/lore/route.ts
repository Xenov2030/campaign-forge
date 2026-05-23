import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, title, content, category, isPublic, tags } = await request.json();

    if (!campaignId || !title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: "campaignId, title y content son requeridos" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede crear entradas de lore" }, { status: 403 });
    }

    const entry = await prisma.loreEntry.create({
      data: {
        campaignId,
        title: title.trim(),
        content: content.trim(),
        category: category ?? "GENERAL",
        isPublic: isPublic ?? false,
        tags: tags ?? [],
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Create lore error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
