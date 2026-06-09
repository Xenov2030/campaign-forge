import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

// PATCH /api/admin/users/[id] — cambia el rol global de un usuario. Solo ADMIN.
// Reglas (diseño §7):
//   - Solo se puede asignar PLAYER o MASTER (nunca ADMIN desde la UI).
//   - No se puede cambiar el rol de un usuario que ya es ADMIN.
//   - Un admin no puede modificar su propio rol (no auto-degradarse).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const { role } = body;

    if (role !== "PLAYER" && role !== "MASTER") {
      return NextResponse.json(
        { error: "Rol inválido. Solo se puede asignar PLAYER o MASTER." },
        { status: 400 }
      );
    }

    if (id === user.id) {
      return NextResponse.json({ error: "No podés cambiar tu propio rol." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!target) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "No se puede cambiar el rol de un administrador desde el panel." },
        { status: 403 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
