import { NextRequest, NextResponse } from "next/server";
import { CampaignTheme } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/api-helpers";

const VALID_THEMES = new Set<string>(Object.values(CampaignTheme));

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

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
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

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

// DELETE /api/campaigns/by-slug/[slug] — eliminar campaña (solo el máster).
// El borrado cascada elimina todo lo de la campaña; el baúl de NPCs (por usuario) se conserva.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { slug } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { id: true, masterId: true },
    });
    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Solo el máster puede eliminar la campaña" }, { status: 403 });
    }

    await prisma.campaign.delete({ where: { id: campaign.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete campaign error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
