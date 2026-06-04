import type { MockDB } from "./seed";

// ── Where matching ────────────────────────────────────────────

export function matchWhere(record: any, where: any): boolean {
  if (!where) return true;

  for (const [key, value] of Object.entries(where)) {
    if (key === "AND") {
      if (!Array.isArray(value)) return false;
      if (!value.every((c) => matchWhere(record, c))) return false;
      continue;
    }
    if (key === "OR") {
      if (!Array.isArray(value)) return false;
      if (!value.some((c) => matchWhere(record, c))) return false;
      continue;
    }
    if (key === "NOT") {
      if (matchWhere(record, value)) return false;
      continue;
    }

    const fieldVal = record[key];

    // Relation operator: { members: { some: {...} } } — skip, return true
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      const keys = Object.keys(value as object);
      if (keys.some((k) => ["some", "every", "none"].includes(k))) continue;

      if ("equals" in (value as any)) {
        if (fieldVal !== (value as any).equals) return false;
        continue;
      }
      if ("in" in (value as any)) {
        if (!((value as any).in as any[]).includes(fieldVal)) return false;
        continue;
      }
      if ("notIn" in (value as any)) {
        if (((value as any).notIn as any[]).includes(fieldVal)) return false;
        continue;
      }
      if ("contains" in (value as any)) {
        const haystack = String(fieldVal ?? "");
        const needle = String((value as any).contains);
        const ci = (value as any).mode === "insensitive";
        const match = ci
          ? haystack.toLowerCase().includes(needle.toLowerCase())
          : haystack.includes(needle);
        if (!match) return false;
        continue;
      }
      if ("not" in (value as any)) {
        if (fieldVal === (value as any).not) return false;
        continue;
      }
      if ("gte" in (value as any) && fieldVal < (value as any).gte) return false;
      if ("gt" in (value as any) && fieldVal <= (value as any).gt) return false;
      if ("lte" in (value as any) && fieldVal > (value as any).lte) return false;
      if ("lt" in (value as any) && fieldVal >= (value as any).lt) return false;
      continue;
    }

    if (fieldVal !== value) return false;
  }

  return true;
}

// ── Compound unique key: { campaignId_userId: { campaignId, userId } } ──

export function matchCompoundWhere(record: any, where: any): boolean {
  for (const [key, value] of Object.entries(where)) {
    // Detect compound key: key contains _ and value is an object
    if (key.includes("_") && typeof value === "object" && value !== null && !(record[key] !== undefined)) {
      const allMatch = Object.entries(value as object).every(
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

export function applyInclude(record: any, include: any, storeKey: string, store: MockDB): any {
  if (!include) return record;
  const result = { ...record };
  const rels = RELATIONS[storeKey] ?? {};

  for (const [field, opts] of Object.entries(include)) {
    // _count: { select: { members: true, sessions: true } }
    if (field === "_count") {
      const countSelect = typeof opts === "object" && opts !== null && "select" in (opts as object)
        ? (opts as any).select
        : opts;
      result._count = {};
      for (const [countField, selected] of Object.entries(countSelect as object)) {
        if (!selected) continue;
        const rel = rels[countField];
        result._count[countField] = rel
          ? (store[rel.storeKey] as any[]).filter((r) => r[rel.foreignKey] === record[rel.localKey]).length
          : 0;
      }
      continue;
    }

    const rel = rels[field];
    if (!rel) continue;

    const all = store[rel.storeKey] as any[];
    const nested = typeof opts === "object" && opts !== null && ("include" in (opts as object) || "select" in (opts as object))
      ? opts as any
      : null;

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
      let related = all.find((r) => r[rel.foreignKey] === record[rel.localKey]) ?? null;
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

export function applySelect(record: any, select: any): any {
  if (!select) return record;
  const out: any = {};
  for (const [k, v] of Object.entries(select)) {
    if (v) out[k] = record[k];
  }
  return out;
}

// ── OrderBy ───────────────────────────────────────────────────

export function applyOrderBy(records: any[], orderBy: any): any[] {
  if (!orderBy) return records;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...records].sort((a, b) => {
    for (const order of orders) {
      for (const [field, dir] of Object.entries(order)) {
        const av = a[field];
        const bv = b[field];
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
      }
    }
    return 0;
  });
}
