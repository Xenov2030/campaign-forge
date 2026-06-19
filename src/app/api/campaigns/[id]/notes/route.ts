import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, parseBody } from "@/lib/api-helpers";

const createSchema = z.object({
  content: z.string().min(1, "El contenido no puede estar vacío").max(10000),
  title: z.string().max(200).optional(),
});

async function assertMembership(campaignId: string, userId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { masterId: true },
  });
  if (!campaign) return "not-found" as const;
  if (campaign.masterId === userId) return "ok" as const;
  const member = await prisma.campaignMember.findUnique({
    where: { campaignId_userId: { campaignId, userId } },
  });
  return member ? ("ok" as const) : ("forbidden" as const);
}

// GET /api/campaigns/[id]/notes — notas del usuario + sesiones + personaje
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id: campaignId } = await params;
    const access = await assertMembership(campaignId, user.id);
    if (access === "not-found") return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (access === "forbidden") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const [notes, sessions, character] = await Promise.all([
      prisma.note.findMany({
        where: { campaignId, userId: user.id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true, content: true, title: true,
          sessionId: true, characterId: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.session.findMany({
        where: { campaignId },
        orderBy: { number: "desc" },
        select: { id: true, number: true, title: true, date: true, status: true },
      }),
      prisma.character.findFirst({
        where: { campaignId, userId: user.id, isNPC: false },
        select: { id: true, name: true, class: true },
      }),
    ]);

    return NextResponse.json({ notes, sessions, character });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/campaigns/[id]/notes — crear nota
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { id: campaignId } = await params;
    const access = await assertMembership(campaignId, user.id);
    if (access === "not-found") return NextResponse.json({ error: "Campaña no encontrada" }, { status: 404 });
    if (access === "forbidden") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const parsed = await parseBody(req, createSchema);
    if (parsed.error) return parsed.error;
    const { content, title } = parsed.data;

    // Opción C: asignar a la sesión más reciente automáticamente
    const [latestSession, character] = await Promise.all([
      prisma.session.findFirst({
        where: { campaignId },
        orderBy: { number: "desc" },
        select: { id: true },
      }),
      prisma.character.findFirst({
        where: { campaignId, userId: user.id, isNPC: false },
        select: { id: true },
      }),
    ]);

    const note = await prisma.note.create({
      data: {
        campaignId,
        userId: user.id,
        content,
        title: title?.trim() || null,
        sessionId: latestSession?.id ?? null,
        characterId: character?.id ?? null,
        isPrivate: true,
      },
      select: {
        id: true, content: true, title: true,
        sessionId: true, characterId: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
