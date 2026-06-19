import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { requireAuth, parseBody } from "@/lib/api-helpers";

const updateSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  title: z.string().max(200).nullable().optional(),
  sessionId: z.string().nullable().optional(),
});

// PATCH /api/campaigns/[id]/notes/[noteId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { noteId } = await params;
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });
    if (!note) return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    if (note.userId !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const parsed = await parseBody(req, updateSchema);
    if (parsed.error) return parsed.error;
    const { content, title, sessionId } = parsed.data;

    const data: Record<string, unknown> = {};
    if (content !== undefined) data.content = content;
    if (title !== undefined) data.title = title?.trim() || null;
    if (sessionId !== undefined) data.sessionId = sessionId;

    const updated = await prisma.note.update({
      where: { id: noteId },
      data,
      select: {
        id: true, content: true, title: true,
        sessionId: true, characterId: true,
        createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id]/notes/[noteId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    const { noteId } = await params;
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { userId: true },
    });
    if (!note) return NextResponse.json({ error: "Nota no encontrada" }, { status: 404 });
    if (note.userId !== user.id) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    await prisma.note.delete({ where: { id: noteId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
