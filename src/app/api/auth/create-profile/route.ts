import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, username, displayName } = await request.json();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } });
    const finalUsername = existingUsername
      ? `${username}_${Math.random().toString(36).slice(2, 6)}`
      : username;

    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email,
        username: finalUsername,
        displayName: displayName || finalUsername,
      },
    });

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
