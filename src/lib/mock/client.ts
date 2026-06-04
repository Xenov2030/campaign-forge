import type { MockDB } from "./seed";
import { getStore, saveStore, newId } from "./store";
import { matchWhere, matchCompoundWhere, applyInclude, applySelect, applyOrderBy } from "./query";

function makeModel(storeKey: keyof MockDB) {
  function records() {
    return getStore()[storeKey] as any[];
  }

  function findAll(args?: any): any[] {
    const { where, include, select, orderBy, skip, take } = args ?? {};
    let rows = records().filter((r) => matchWhere(r, where));
    rows = applyOrderBy(rows, orderBy);
    if (skip) rows = rows.slice(skip);
    if (take) rows = rows.slice(0, take);
    if (include) rows = rows.map((r) => applyInclude(r, include, storeKey as string, getStore()));
    if (select) rows = rows.map((r) => applySelect(r, select));
    return rows;
  }

  return {
    findMany: async (args?: any) => findAll(args),

    findFirst: async (args?: any) => findAll(args)[0] ?? null,

    findUnique: async (args?: any) => {
      const { where, include, select } = args ?? {};
      let row: any;
      // Detect compound unique key: { campaignId_userId: {...} }
      const hasCompound = Object.keys(where).some(
        (k) => k.includes("_") && typeof where[k] === "object" && where[k] !== null && !records().some((r) => r[k] !== undefined)
      );
      if (hasCompound) {
        row = records().find((r) => matchCompoundWhere(r, where)) ?? null;
      } else {
        row = records().find((r) => matchWhere(r, where)) ?? null;
      }
      if (!row) return null;
      if (include) row = applyInclude(row, include, storeKey as string, getStore());
      if (select) row = applySelect(row, select);
      return row;
    },

    create: async (args: any) => {
      const { data, include, select } = args;
      const now = new Date().toISOString();
      const row = {
        id: newId(),
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      (getStore()[storeKey] as any[]).push(row);
      saveStore();
      let out = row;
      if (include) out = applyInclude(out, include, storeKey as string, getStore());
      if (select) out = applySelect(out, select);
      return out;
    },

    update: async (args: any) => {
      const { where, data, include, select } = args;
      const arr = getStore()[storeKey] as any[];
      const idx = arr.findIndex((r) => matchWhere(r, where));
      if (idx === -1) throw new Error(`[mock] ${storeKey}.update: record not found`);
      arr[idx] = { ...arr[idx], ...data, updatedAt: new Date().toISOString() };
      saveStore();
      let out = arr[idx];
      if (include) out = applyInclude(out, include, storeKey as string, getStore());
      if (select) out = applySelect(out, select);
      return out;
    },

    updateMany: async (args?: any) => {
      const { where, data } = args ?? {};
      const arr = getStore()[storeKey] as any[];
      let count = 0;
      for (let i = 0; i < arr.length; i++) {
        if (matchWhere(arr[i], where)) {
          arr[i] = { ...arr[i], ...data, updatedAt: new Date().toISOString() };
          count++;
        }
      }
      saveStore();
      return { count };
    },

    delete: async (args: any) => {
      const { where } = args;
      const arr = getStore()[storeKey] as any[];
      const idx = arr.findIndex((r) => matchWhere(r, where));
      if (idx === -1) throw new Error(`[mock] ${storeKey}.delete: record not found`);
      const [deleted] = arr.splice(idx, 1);
      saveStore();
      return deleted;
    },

    deleteMany: async (args?: any) => {
      const { where } = args ?? {};
      const arr = getStore()[storeKey] as any[];
      const before = arr.length;
      const next = arr.filter((r) => !matchWhere(r, where));
      (getStore() as any)[storeKey] = next;
      saveStore();
      return { count: before - next.length };
    },

    upsert: async (args: any) => {
      const { where, create, update, include, select } = args;
      const arr = getStore()[storeKey] as any[];
      const hasCompound = Object.keys(where).some(
        (k) => k.includes("_") && typeof where[k] === "object" && where[k] !== null
      );
      const idx = hasCompound
        ? arr.findIndex((r) => matchCompoundWhere(r, where))
        : arr.findIndex((r) => matchWhere(r, where));

      let row: any;
      if (idx >= 0) {
        arr[idx] = { ...arr[idx], ...update, updatedAt: new Date().toISOString() };
        row = arr[idx];
      } else {
        const now = new Date().toISOString();
        row = { id: newId(), createdAt: now, updatedAt: now, ...create };
        arr.push(row);
      }
      saveStore();
      if (include) row = applyInclude(row, include, storeKey as string, getStore());
      if (select) row = applySelect(row, select);
      return row;
    },

    count: async (args?: any) => {
      const { where } = args ?? {};
      return records().filter((r) => matchWhere(r, where)).length;
    },
  };
}

export function createMockClient() {
  return {
    user: makeModel("users"),
    campaign: makeModel("campaigns"),
    campaignMember: makeModel("campaignMembers"),
    character: makeModel("characters"),
    inventoryItem: makeModel("inventoryItems"),
    characterSpell: makeModel("characterSpells"),
    characterRelationship: makeModel("characterRelationships"),
    nPC: makeModel("npcs"),
    monster: makeModel("monsters"),
    location: makeModel("locations"),
    faction: makeModel("factions"),
    item: makeModel("items"),
    quest: makeModel("quests"),
    session: makeModel("sessions"),
    note: makeModel("notes"),
    chatRoom: makeModel("chatRooms"),
    chatMessage: makeModel("chatMessages"),
    diceRoll: makeModel("diceRolls"),
    loreEntry: makeModel("loreEntries"),
    timelineEvent: makeModel("timelineEvents"),
    gameMap: makeModel("gameMaps"),
    visualAid: makeModel("visualAids"),
    generatedContent: makeModel("generatedContent"),
    $transaction: async (ops: any[] | ((tx: any) => Promise<any>)) => {
      if (typeof ops === "function") return ops(createMockClient());
      return Promise.all(ops);
    },
    $disconnect: async () => {},
  };
}
