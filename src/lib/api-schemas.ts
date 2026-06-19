import { z } from "zod";

const s = z.string().optional().nullable();
const n = z.number().optional().nullable();
const b = z.boolean().optional();
const arr = z.array(z.unknown()).optional();
const rec = z.record(z.string(), z.unknown()).optional();

export const CreateCharacterBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  race: s, className: s, subclass: s,
  level: z.number().int().min(1).max(20).optional(),
  background: s, alignment: s, appearance: s, backstory: s, ideals: s,
  portraitUrl: s, bannerUrl: s,
  str: z.number().int().min(1).max(30).optional(),
  dex: z.number().int().min(1).max(30).optional(),
  con: z.number().int().min(1).max(30).optional(),
  int: z.number().int().min(1).max(30).optional(),
  wis: z.number().int().min(1).max(30).optional(),
  cha: z.number().int().min(1).max(30).optional(),
  hitPoints: z.number().int().min(0).optional(),
  maxHitPoints: z.number().int().min(0).optional(),
  armorClass: z.number().int().min(0).optional(),
  speed: z.number().int().min(0).optional(),
});

export const CreateNpcBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  nickname: s, race: s, occupation: s, age: s, gender: s,
  appearance: s, personality: s, backstory: s, motivations: s,
  secrets: s, quirks: s, voiceNotes: s, portraitUrl: s,
  isKnownToParty: b, isAlive: b,
  hitPoints: n, maxHitPoints: n,
  location: s, faction: s,
  tags: z.array(z.string()).optional(),
});

export const CreateMonsterBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  type: s, size: s, alignment: s, challengeRating: s, hitPoints: s,
  armorClass: n,
  speed: rec, stats: rec, skills: rec, senses: rec,
  languages: s,
  abilities: arr, actions: arr, reactions: arr, legendaryActions: arr,
  lore: s, imageUrl: s,
  tags: z.array(z.string()).optional(),
});

export const CreateItemBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  type: s, rarity: z.string().optional(),
  description: s, lore: s,
  isArtifact: b, requiresAttunement: b, isKnownToParty: b,
  imageUrl: s,
  tags: z.array(z.string()).optional(),
});

export const CreateQuestBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: s, type: z.string().optional(), status: z.string().optional(),
  hook: s, notes: s,
  objectives: arr,
  rewards: rec,
  isKnownToParty: b, deadline: s,
  tags: z.array(z.string()).optional(),
});

export const CreateSessionBody = z.object({
  campaignId: z.string().min(1, "campaignId es requerido"),
  title: s, date: s, time: s, duration: n, summary: s, notes: s,
  status: z.string().optional(), isPresential: b,
  attendeeIds: z.array(z.string()).optional(),
});
