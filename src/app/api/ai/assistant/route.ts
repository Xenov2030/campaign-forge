import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { AI_ENABLED } from "@/lib/ai/gemini";
import { askMasterAssistant } from "@/lib/ai/generators";

export async function POST(request: NextRequest) {
  try {
    if (!AI_ENABLED) {
      return NextResponse.json({ error: "AI no configurada. Añade GEMINI_API_KEY al .env" }, { status: 503 });
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { campaignId, question, history } = await request.json();

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    if (campaign.masterId !== user.id) {
      return NextResponse.json({ error: "Only the master can use the assistant" }, { status: 403 });
    }

    const context = {
      name: campaign.name,
      theme: campaign.theme,
      system: campaign.system,
      description: campaign.description ?? undefined,
    };

    const response = await askMasterAssistant(context, question, history ?? []);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Assistant error:", error);
    return NextResponse.json({ error: "Assistant error" }, { status: 500 });
  }
}
