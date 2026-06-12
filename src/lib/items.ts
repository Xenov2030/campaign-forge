import { ItemRarity } from "@prisma/client";

export const ITEM_RARITIES = Object.values(ItemRarity) as ItemRarity[];

const VALID_RARITIES = new Set<string>(ITEM_RARITIES);
export const isItemRarity = (v: unknown): v is ItemRarity => typeof v === "string" && VALID_RARITIES.has(v);

export const ITEM_RARITY_LABELS: Record<ItemRarity, string> = {
  COMMON: "Común",
  UNCOMMON: "Poco común",
  RARE: "Raro",
  VERY_RARE: "Muy raro",
  LEGENDARY: "Legendario",
  ARTIFACT: "Artefacto",
};

// Color por rareza (convención tipo D&D).
export const ITEM_RARITY_COLOR: Record<ItemRarity, string> = {
  COMMON: "bg-gray-600/20 text-gray-300 border-gray-500/40",
  UNCOMMON: "bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30",
  RARE: "bg-[#60a5fa]/15 text-[#60a5fa] border-[#60a5fa]/30",
  VERY_RARE: "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30",
  LEGENDARY: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  ARTIFACT: "bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30",
};

// Tag que marca un objeto como elegible para recompensa de misión.
export const MISSION_REWARD_TAG = "Objeto de misión";
