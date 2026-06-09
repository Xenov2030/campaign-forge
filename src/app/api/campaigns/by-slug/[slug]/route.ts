import { NextRequest, NextResponse } from "next/server";
import { CampaignTheme } from "@prisma/client";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

const VALID_THEMES = new Set<string>(Object.values(CampaignTheme));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { id: true, name: true, theme: true, system: true, masterId: true },
    });

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/campaigns/by-slug/[slug] — editar campaña (solo master)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { id: true, masterId: true },
    });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede editar la campaña" }, { status: 403 });
    }

    const body = await request.json();
    const data: {
      name?: string;
      description?: string | null;
      isPublic?: boolean;
      bannerImage?: string | null;
      theme?: CampaignTheme;
    } = {};
    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description.trim() || null;
    if (typeof body.isPublic === "boolean") data.isPublic = body.isPublic;
    if ("bannerImage" in body) data.bannerImage = typeof body.bannerImage === "string" && body.bannerImage ? body.bannerImage : null;
    if (typeof body.theme === "string" && VALID_THEMES.has(body.theme)) data.theme = body.theme as CampaignTheme;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para actualizar" }, { status: 400 });
    }

    // El slug NO se regenera: es la URL estable de la campaña.
    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data,
      select: { id: true, name: true, description: true, isPublic: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
