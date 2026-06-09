import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { AI_ENABLED } from "@/lib/ai/gemini";
import {
  generateNPC,
  generateMonster,
  generateItem,
  generateQuest,
  generateLocation,
  generateSessionSummary,
} from "@/lib/ai/generators";

export async function POST(request: NextRequest) {
  try {
    if (!AI_ENABLED) {
      return NextResponse.json({ error: "AI no configurada. Añade GEMINI_API_KEY al .env" }, { status: 503 });
    }

    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { type, campaignId, hints, additionalContext } = await request.json();

    if (!type || !campaignId) {
      return NextResponse.json({ error: "type and campaignId are required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });

    const isMaster = campaign.masterId === user.id;
    const isMember = await prisma.campaignMember.findUnique({
      where: { campaignId_userId: { campaignId, userId: user.id } },
    });

    if (!isMaster && !isMember) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const context = {
      name: campaign.name,
      theme: campaign.theme,
      system: campaign.system,
      description: campaign.description ?? undefined,
    };

    let result: unknown;
    const model = "gemini-2.0-flash";

    switch (type) {
      case "NPC":
        result = await generateNPC(context, hints);
        break;
      case "MONSTER":
        result = await generateMonster(context, hints);
        break;
      case "ITEM":
        result = await generateItem(context, hints);
        break;
      case "QUEST":
        result = await generateQuest(context, hints);
        break;
      case "LOCATION":
        result = await generateLocation(context, hints);
        break;
      case "SESSION_SUMMARY":
        const summary = await generateSessionSummary(
          context,
          additionalContext?.notes ?? "",
          additionalContext?.previousSummary
        );
        result = { summary };
        break;
      default:
        return NextResponse.json({ error: "Unknown content type" }, { status: 400 });
    }

    // Save generation to history
    await prisma.generatedContent.create({
      data: {
        campaignId,
        userId: user.id,
        type: type as never,
        prompt: hints ?? `Generate ${type}`,
        result,
        model,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AI generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
