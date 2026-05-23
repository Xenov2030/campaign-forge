import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action, displayName, currentPassword, newPassword } = await request.json();

  if (action === "display_name") {
    if (!displayName?.trim()) {
      return NextResponse.json({ error: "El nombre visible no puede estar vacío" }, { status: 400 });
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { displayName: displayName.trim() },
    });
    return NextResponse.json({ ok: true, displayName: updated.displayName });
  }

  if (action === "password") {
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    const valid = await verifyPassword(currentPassword, user.passwordHash ?? "");
    if (!valid) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }
    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
}
