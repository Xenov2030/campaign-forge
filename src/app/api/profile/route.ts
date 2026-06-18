import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-helpers";
import { hashPassword, verifyPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const { action, displayName, currentPassword, newPassword, avatarUrl, email } = await request.json();

    if (action === "avatar") {
      // avatarUrl vacío ⇒ quitar la foto (volver al fallback de iniciales).
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: typeof avatarUrl === "string" && avatarUrl ? avatarUrl : null },
      });
      return NextResponse.json({ ok: true, avatarUrl: updated.avatarUrl });
    }

    if (action === "email") {
      const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
        return NextResponse.json({ error: "El correo no tiene un formato válido" }, { status: 400 });
      }
      // Sin cambios: cortamos temprano y evitamos query + update.
      if (normalized === user.email.toLowerCase()) {
        return NextResponse.json({ ok: true, email: user.email });
      }
      const existing = await prisma.user.findUnique({ where: { email: normalized } });
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "Ese correo ya está en uso por otra cuenta" }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { email: normalized },
      });
      return NextResponse.json({ ok: true, email: updated.email });
    }

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
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 });
  }
}
