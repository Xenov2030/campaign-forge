import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await clearSession();
  // Redirige a la home usando el origen real del request (sirve en local y en prod,
  // sin depender de NEXT_PUBLIC_APP_URL).
  return NextResponse.redirect(new URL("/", request.url));
}
