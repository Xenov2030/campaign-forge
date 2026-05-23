import { NextRequest, NextResponse } from "next/server";
import { loginUser, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const user = await loginUser(email, password);
    await setSession(user.id);

    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, username: user.username, displayName: user.displayName } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al iniciar sesión";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
