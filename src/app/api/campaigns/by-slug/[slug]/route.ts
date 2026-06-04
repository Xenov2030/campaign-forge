import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUser } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      select: { id: true, name: true, theme: true, system: true, masterId: true },
    });

    if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(campaign);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
