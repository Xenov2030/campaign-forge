import { NextRequest, NextResponse } from "next/server";
import { registerUser, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, displayName, password } = await request.json();

    if (!email || !fullName || !password) {
      return NextResponse.json({ error: "Email, nombre y contraseña requeridos" }, { status: 400 });
    }

    const user = await registerUser({ email, fullName: fullName.trim(), displayName: (displayName || "").trim(), password });
    await setSession(user.id);

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, username: user.username, displayName: user.displayName } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear la cuenta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
