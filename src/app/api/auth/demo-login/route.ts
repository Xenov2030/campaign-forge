import { type NextRequest, NextResponse } from "next/server";
import { loginUser, setSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  try {
    const user = await loginUser("master@demo.com", "password123");
    await setSession(user.id);
    return NextResponse.redirect(new URL("/dashboard", origin));
  } catch {
    return NextResponse.redirect(new URL("/login?demo=unavailable", origin));
  }
}
