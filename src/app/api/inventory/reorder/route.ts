import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as { ids?: unknown };
  if (!Array.isArray(body.ids)) {
    return NextResponse.json({ error: "ids requerido" }, { status: 400 });
  }

  // El reorden es optimista en UI. Sin campo sortOrder en el schema no hay persistencia.
  return NextResponse.json({ ok: true });
}
