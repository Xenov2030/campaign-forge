import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { slugify, generateInviteCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Solo MASTER/ADMIN pueden crear campañas. Un PLAYER no está habilitado.
    if (user.role === "PLAYER") {
      return NextResponse.json(
        { error: "No tenés permiso para crear campañas. Pedile a un administrador que te habilite como máster." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, themes, tones, systems, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Las columnas `theme`/`system` son enums de un solo valor: guardamos el
    // primero elegido como PRINCIPAL (alimenta los colores y las fichas) y el
    // resto de la selección múltiple va al campo `settings` (Json).
    const themeList: string[] = Array.isArray(themes) && themes.length ? themes : ["FANTASY"];
    const systemList: string[] = Array.isArray(systems) && systems.length ? systems : ["DND5E"];
    const toneList: string[] = Array.isArray(tones) ? tones : [];

    let slug = slugify(name);
    let counter = 0;
    while (await prisma.campaign.findUnique({ where: { slug } })) {
      counter++;
      slug = `${slugify(name)}-${counter}`;
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        slug,
        theme: themeList[0] as never,
        system: systemList[0] as never,
        isPublic: isPublic ?? false,
        settings: { themes: themeList, tones: toneList, systems: systemList },
        inviteCode: generateInviteCode(),
        masterId: user.id,
      },
    });

    await prisma.campaignMember.create({
      data: { campaignId: campaign.id, userId: user.id, role: "MASTER" },
    });

    await prisma.chatRoom.create({
      data: {
        campaignId: campaign.id,
        name: "General",
        type: "PUBLIC",
        description: "Canal general de la campaña",
      },
    });

    return NextResponse.json({ campaign, slug: campaign.slug }, { status: 201 });
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const campaigns = await prisma.campaign.findMany({
      where: {
        OR: [
          { masterId: user.id },
          { members: { some: { userId: user.id } } },
        ],
      },
      include: {
        master: { select: { displayName: true, avatarUrl: true } },
        _count: { select: { members: true, sessions: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
