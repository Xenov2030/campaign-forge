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

// Tipos ofrecidos en formularios y filtros (BOUNTY queda fuera; todas dan recompensa).
export const QUEST_TYPE_OPTIONS: QuestType[] = ["MAIN", "SIDE", "PERSONAL", "FACTION"];

// Color distintivo por tipo (clases para el badge).
export const QUEST_TYPE_COLOR: Record<QuestType, string> = {
  MAIN: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
  SIDE: "bg-[#60a5fa]/15 text-[#60a5fa] border-[#60a5fa]/30",
  PERSONAL: "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30",
  FACTION: "bg-[#34d399]/15 text-[#34d399] border-[#34d399]/30",
  BOUNTY: "bg-gray-700/30 text-gray-300 border-gray-600/40",
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
  itemId: string | null;
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

// Deriva el estado a partir de los objetivos: todos completos => COMPLETED;
// si se destilda alguno y estaba COMPLETED, vuelve a ACTIVE. Otros estados se respetan.
export function autoStatusFromObjectives(objectives: QuestObjective[], current: QuestStatus): QuestStatus {
  if (objectives.length === 0) return current;
  const allDone = objectives.every((o) => o.completed);
  if (allDone) return "COMPLETED";
  if (current === "COMPLETED") return "ACTIVE";
  return current;
}

export function sanitizeRewards(raw: unknown): QuestRewards {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const xp = obj.experience;
  return {
    experience: typeof xp === "number" ? xp : typeof xp === "string" && xp.trim() ? Number(xp) || null : null,
    gold: typeof obj.gold === "string" ? obj.gold.trim() : "",
    other: typeof obj.other === "string" ? obj.other.trim() : "",
    itemId: typeof obj.itemId === "string" && obj.itemId ? obj.itemId : null,
  };
}
