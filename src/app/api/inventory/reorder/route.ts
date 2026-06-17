import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as { ids?: unknown };
  if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "ids requerido" }, { status: 400 });
  }

  const ids = body.ids as string[];

  // Verify ownership: all items must belong to a character owned by this user
  const items = await prisma.inventoryItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, character: { select: { userId: true } } },
  });

  if (items.some((it: { character: { userId: string } }) => it.character.userId !== user.id)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.inventoryItem.update({ where: { id }, data: { sortOrder: index } })
    )
  );

  return NextResponse.json({ ok: true });
}
