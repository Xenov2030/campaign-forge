import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

// GET /api/item-vault — lista objetos del baúl del usuario.
export async function GET() {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const vault = await prisma.vaultItem.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ vault });
  } catch (error) {
    console.error("Item vault list error:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
