import { NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json(null, { status: 401 });
  return NextResponse.json({ id: user.id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl });
}
