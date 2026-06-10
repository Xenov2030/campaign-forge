import { QuestType, QuestStatus } from "@prisma/client";

export const QUEST_TYPES = Object.values(QuestType) as QuestType[];
export const QUEST_STATUSES = Object.values(QuestStatus) as QuestStatus[];

const VALID_TYPES = new Set<string>(QUEST_TYPES);
const VALID_STATUSES = new Set<string>(QUEST_STATUSES);

export const isQuestType = (v: unknown): v is QuestType => typeof v === "string" && VALID_TYPES.has(v);
export const isQuestStatus = (v: unknown): v is QuestStatus => typeof v === "string" && VALID_STATUSES.has(v);

export const QUEST_TYPE_LABELS: Record<QuestType, string> = {
  MAIN: "Principal",
  SIDE: "Secundaria",
  PERSONAL: "Personal",
  FACTION: "Facción",
  BOUNTY: "Recompensa",
};

export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  ACTIVE: "Activa",
  COMPLETED: "Completada",
  FAILED: "Fallada",
  INACTIVE: "Inactiva",
};

export interface QuestObjective {
  id: string;
  description: string;
  isOptional: boolean;
  completed: boolean;
}

export interface QuestRewards {
  experience: number | null;
  gold: string;
  other: string;
}

// Genera un id estable para un objetivo nuevo (cliente o servidor).
export function newObjectiveId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `obj-${Math.round(Math.random() * 1e9).toString(36)}`;
}

// Normaliza el array de objetivos: descarta vacíos, asegura id/flags booleanos.
export function sanitizeObjectives(raw: unknown): QuestObjective[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o): QuestObjective => {
      const obj = o && typeof o === "object" ? (o as Record<string, unknown>) : {};
      return {
        id: typeof obj.id === "string" && obj.id ? obj.id : newObjectiveId(),
        description: typeof obj.description === "string" ? obj.description.trim() : "",
        isOptional: obj.isOptional === true,
        completed: obj.completed === true,
      };
    })
    .filter((o) => o.description !== "");
}

export function sanitizeRewards(raw: unknown): QuestRewards {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const xp = obj.experience;
  return {
    experience: typeof xp === "number" ? xp : typeof xp === "string" && xp.trim() ? Number(xp) || null : null,
    gold: typeof obj.gold === "string" ? obj.gold.trim() : "",
    other: typeof obj.other === "string" ? obj.other.trim() : "",
  };
}
