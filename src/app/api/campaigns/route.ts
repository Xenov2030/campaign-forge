import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";
import { slugify, generateInviteCode } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name, description, theme, system, isPublic } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

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
        theme: theme ?? "FANTASY",
        system: system ?? "DND5E",
        isPublic: isPublic ?? false,
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
