import { NextResponse } from "next/server";
import { loginUser, setSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await loginUser("master@demo.com", "password123");
    await setSession(user.id);
    return NextResponse.redirect(
      new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=demo", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }
}
