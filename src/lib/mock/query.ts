import type { MockDB, MockRecord } from "./seed";

// ── Input shapes (imitan los args de Prisma, sin acoplarse a sus tipos) ──

export type WhereInput = Record<string, unknown>;
export type IncludeInput = Record<string, unknown>;
export type SelectInput = Record<string, unknown>;
export type OrderByInput = Record<string, unknown> | Record<string, unknown>[];

/** Operadores de filtro soportados dentro de un campo del where. */
type FilterOps = {
  equals?: unknown;
  in?: unknown[];
  notIn?: unknown[];
  contains?: string;
  mode?: string;
  not?: unknown;
  gte?: number;
  gt?: number;
  lte?: number;
  lt?: number;
};

// ── Where matching ────────────────────────────────────────────

export function matchWhere(record: MockRecord, where?: WhereInput): boolean {
  if (!where) return true;

  for (const [key, value] of Object.entries(where)) {
    if (key === "AND") {
      if (!Array.isArray(value)) return false;
      if (!value.every((c) => matchWhere(record, c as WhereInput))) return false;
      continue;
    }
    if (key === "OR") {
      if (!Array.isArray(value)) return false;
      if (!value.some((c) => matchWhere(record, c as WhereInput))) return false;
      continue;
    }
    if (key === "NOT") {
      if (matchWhere(record, value as WhereInput)) return false;
      continue;
    }

    const fieldVal = record[key];

    // Relation operator: { members: { some: {...} } } — skip, return true
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const op = value as FilterOps;
      const keys = Object.keys(value);
      if (keys.some((k) => ["some", "every", "none"].includes(k))) continue;

      if ("equals" in op) {
        if (fieldVal !== op.equals) return false;
        continue;
      }
      if ("in" in op) {
        if (!(op.in as unknown[]).includes(fieldVal)) return false;
        continue;
      }
      if ("notIn" in op) {
        if ((op.notIn as unknown[]).includes(fieldVal)) return false;
        continue;
      }
      if ("contains" in op) {
        const haystack = String(fieldVal ?? "");
        const needle = String(op.contains);
        const ci = op.mode === "insensitive";
        const match = ci
          ? haystack.toLowerCase().includes(needle.toLowerCase())
          : haystack.includes(needle);
        if (!match) return false;
        continue;
      }
      if ("not" in op) {
        if (fieldVal === op.not) return false;
        continue;
      }
      if ("gte" in op && (fieldVal as number) < (op.gte as number)) return false;
      if ("gt" in op && (fieldVal as number) <= (op.gt as number)) return false;
      if ("lte" in op && (fieldVal as number) > (op.lte as number)) return false;
      if ("lt" in op && (fieldVal as number) >= (op.lt as number)) return false;
      continue;
    }

    if (fieldVal !== value) return false;
  }

  return true;
}

// ── Compound unique key: { campaignId_userId: { campaignId, userId } } ──

export function matchCompoundWhere(record: MockRecord, where: WhereInput): boolean {
  for (const [key, value] of Object.entries(where)) {
    // Detect compound key: key contains _ and value is an object
    if (key.includes("_") && typeof value === "object" && value !== null && !(record[key] !== undefined)) {
      const allMatch = Object.entries(value as Record<string, unknown>).every(
        ([k, v]) => record[k] === v
      );
      if (!allMatch) return false;
    } else {
      if (record[key] !== value) return false;
    }
  }
  return true;
}

// ── Relations map ─────────────────────────────────────────────

type RelDef = { storeKey: keyof MockDB; localKey: string; foreignKey: string; isMany: boolean };

const RELATIONS: Record<string, Record<string, RelDef>> = {
  campaigns: {
    master: { storeKey: "users", localKey: "masterId", foreignKey: "id", isMany: false },
    members: { storeKey: "campaignMembers", localKey: "id", foreignKey: "campaignId", isMany: true },
    characters: { storeKey: "characters", localKey: "id", foreignKey: "campaignId", isMany: true },
    npcs: { storeKey: "npcs", localKey: "id", foreignKey: "campaignId", isMany: true },
    monsters: { storeKey: "monsters", localKey: "id", foreignKey: "campaignId", isMany: true },
    locations: { storeKey: "locations", localKey: "id", foreignKey: "campaignId", isMany: true },
    factions: { storeKey: "factions", localKey: "id", foreignKey: "campaignId", isMany: true },
    items: { storeKey: "items", localKey: "id", foreignKey: "campaignId", isMany: true },
    quests: { storeKey: "quests", localKey: "id", foreignKey: "campaignId", isMany: true },
    sessions: { storeKey: "sessions", localKey: "id", foreignKey: "campaignId", isMany: true },
    notes: { storeKey: "notes", localKey: "id", foreignKey: "campaignId", isMany: true },
    chatRooms: { storeKey: "chatRooms", localKey: "id", foreignKey: "campaignId", isMany: true },
    loreEntries: { storeKey: "loreEntries", localKey: "id", foreignKey: "campaignId", isMany: true },
    events: { storeKey: "timelineEvents", localKey: "id", foreignKey: "campaignId", isMany: true },
    maps: { storeKey: "gameMaps", localKey: "id", foreignKey: "campaignId", isMany: true },
    visualAids: { storeKey: "visualAids", localKey: "id", foreignKey: "campaignId", isMany: true },
    generatedContent: { storeKey: "generatedContent", localKey: "id", foreignKey: "campaignId", isMany: true },
  },
  campaignMembers: {
    user: { storeKey: "users", localKey: "userId", foreignKey: "id", isMany: false },
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
  },
  characters: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
    user: { storeKey: "users", localKey: "userId", foreignKey: "id", isMany: false },
    inventory: { storeKey: "inventoryItems", localKey: "id", foreignKey: "characterId", isMany: true },
    spells: { storeKey: "characterSpells", localKey: "id", foreignKey: "characterId", isMany: true },
    notes: { storeKey: "notes", localKey: "id", foreignKey: "characterId", isMany: true },
  },
  npcs: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
  },
  monsters: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
  },
  sessions: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
    master: { storeKey: "users", localKey: "masterId", foreignKey: "id", isMany: false },
  },
  quests: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
  },
  notes: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
    user: { storeKey: "users", localKey: "userId", foreignKey: "id", isMany: false },
  },
  chatRooms: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
    messages: { storeKey: "chatMessages", localKey: "id", foreignKey: "roomId", isMany: true },
  },
  chatMessages: {
    user: { storeKey: "users", localKey: "userId", foreignKey: "id", isMany: false },
  },
  loreEntries: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
  },
  locations: {
    campaign: { storeKey: "campaigns", localKey: "campaignId", foreignKey: "id", isMany: false },
    parent: { storeKey: "locations", localKey: "parentId", foreignKey: "id", isMany: false },
    children: { storeKey: "locations", localKey: "id", foreignKey: "parentId", isMany: true },
  },
  inventoryItems: {
    character: { storeKey: "characters", localKey: "characterId", foreignKey: "id", isMany: false },
  },
};

// ── Include / _count resolution ───────────────────────────────

type NestedRelOpts = { where?: WhereInput; include?: IncludeInput; select?: SelectInput };

export function applyInclude(
  record: MockRecord,
  include: IncludeInput | undefined,
  storeKey: string,
  store: MockDB
): MockRecord {
  if (!include) return record;
  const result: MockRecord = { ...record };
  const rels = RELATIONS[storeKey] ?? {};

  for (const [field, opts] of Object.entries(include)) {
    // _count: { select: { members: true, sessions: true } }
    if (field === "_count") {
      const countSelect = (typeof opts === "object" && opts !== null && "select" in opts
        ? (opts as { select: Record<string, unknown> }).select
        : opts) as Record<string, unknown>;
      const counts: Record<string, number> = {};
      for (const [countField, selected] of Object.entries(countSelect)) {
        if (!selected) continue;
        const rel = rels[countField];
        counts[countField] = rel
          ? (store[rel.storeKey] as MockRecord[]).filter((r) => r[rel.foreignKey] === record[rel.localKey]).length
          : 0;
      }
      result._count = counts;
      continue;
    }

    const rel = rels[field];
    if (!rel) continue;

    const all = store[rel.storeKey] as MockRecord[];
    const nested = (typeof opts === "object" && opts !== null && ("include" in opts || "select" in opts)
      ? opts
      : null) as NestedRelOpts | null;

    if (rel.isMany) {
      let related = all.filter((r) => r[rel.foreignKey] === record[rel.localKey]);
      if (nested?.where) related = related.filter((r) => matchWhere(r, nested.where));
      if (nested?.include) {
        const nestedStoreKey = rel.storeKey as string;
        related = related.map((r) => applyInclude(r, nested.include, nestedStoreKey, store));
      }
      if (nested?.select) related = related.map((r) => applySelect(r, nested.select));
      result[field] = related;
    } else {
      let related: MockRecord | null = all.find((r) => r[rel.foreignKey] === record[rel.localKey]) ?? null;
      if (related && nested?.include) {
        related = applyInclude(related, nested.include, rel.storeKey as string, store);
      }
      if (related && nested?.select) related = applySelect(related, nested.select);
      result[field] = related;
    }
  }

  return result;
}

// ── Select projection ─────────────────────────────────────────

export function applySelect(record: MockRecord, select?: SelectInput): MockRecord {
  if (!select) return record;
  const out: MockRecord = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = record[k];
  }
  return out;
}

// ── OrderBy ───────────────────────────────────────────────────

export function applyOrderBy(records: MockRecord[], orderBy?: OrderByInput): MockRecord[] {
  if (!orderBy) return records;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...records].sort((a, b) => {
    for (const order of orders) {
      for (const [field, dir] of Object.entries(order)) {
        const av = a[field] as number | string;
        const bv = b[field] as number | string;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
}
