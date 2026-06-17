import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { MonsterForm } from "@/components/campaign/monster-form";
import type { MonsterFormValues } from "@/components/campaign/monster-form";

interface PageProps {
  params: Promise<{ campaignSlug: string; monsterId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { monsterId } = await params;
  const m = await prisma.monster.findUnique({ where: { id: monsterId }, select: { name: true } });
  return { title: `Editar — ${m?.name ?? "Monstruo"}` };
}

export default async function EditMonsterPage({ params }: PageProps) {
  const { campaignSlug, monsterId } = await params;
  const user = await getUser();
  if (!user) redirect("/login");

  const monster = await prisma.monster.findUnique({
    where: { id: monsterId },
    include: { campaign: true },
  });
  if (!monster) notFound();
  if (monster.campaign.masterId !== user.id) redirect(`/${campaignSlug}/monsters/${monsterId}`);

  const toStr = (v: unknown): string => (typeof v === "string" ? v : "");
  const toNum = (v: unknown): number => (typeof v === "number" ? v : 10);

  const rawStats = (monster.stats as Record<string, unknown>) ?? {};
  const rawSpeed = (monster.speed as Record<string, unknown>) ?? {};
  const rawSenses = (monster.senses as Record<string, unknown>) ?? {};
  const rawSkills = (monster.skills as Record<string, unknown>) ?? {};

  const toEntries = (v: unknown): { name: string; description: string }[] => {
    if (!Array.isArray(v)) return [];
    return v.filter((x): x is { name: string; description: string } =>
      typeof x === "object" && x !== null && "name" in x && "description" in x
    );
  };

  const initial: Partial<MonsterFormValues> = {
    name: monster.name,
    type: toStr(monster.type),
    size: toStr(monster.size) || "Mediano",
    alignment: toStr(monster.alignment),
    challengeRating: toStr(monster.challengeRating),
    hitPoints: toStr(monster.hitPoints),
    armorClass: monster.armorClass?.toString() ?? "",
    languages: toStr(monster.languages),
    lore: toStr(monster.lore),
    imageUrl: toStr(monster.imageUrl),
    tags: monster.tags,
    stats: {
      str: toNum(rawStats.str), dex: toNum(rawStats.dex), con: toNum(rawStats.con),
      int: toNum(rawStats.int), wis: toNum(rawStats.wis), cha: toNum(rawStats.cha),
    },
    speed: {
      walk: toStr(rawSpeed.walk), fly: toStr(rawSpeed.fly), swim: toStr(rawSpeed.swim),
      climb: toStr(rawSpeed.climb), burrow: toStr(rawSpeed.burrow),
    },
    senses: {
      darkvision: toStr(rawSenses.darkvision), blindsight: toStr(rawSenses.blindsight),
      tremorsense: toStr(rawSenses.tremorsense), truesight: toStr(rawSenses.truesight),
      passivePerception: rawSenses.passivePerception != null ? String(rawSenses.passivePerception) : "",
    },
    skills: Object.fromEntries(
      Object.entries(rawSkills).filter(([, v]) => typeof v === "number").map(([k, v]) => [k, v as number])
    ),
    abilities: toEntries(monster.abilities),
    actions: toEntries(monster.actions),
    reactions: toEntries(monster.reactions),
    legendaryActions: toEntries(monster.legendaryActions),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-black text-[var(--text-primary)]">Editar monstruo</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">{monster.name}</p>
      </div>
      <MonsterForm slug={campaignSlug} mode="edit" monsterId={monsterId} initial={initial} />
    </div>
  );
}
