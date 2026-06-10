import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// DELETE /api/npc-vault/[id] — quita una entrada del baúl (los NPCs vinculados se desvinculan).
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const entry = await prisma.vaultNpc.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: "Entrada no encontrada" }, { status: 404 });
    if (entry.userId !== user.id) {
      return NextResponse.json({ error: "No es tu baúl" }, { status: 403 });
    }

    await prisma.vaultNpc.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Vault delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno" },
      { status: 500 }
    );
  }
}
