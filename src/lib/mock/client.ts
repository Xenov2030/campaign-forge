import type { MockDB, MockRecord } from "./seed";
import { getStore, saveStore, newId } from "./store";
import {
  matchWhere,
  matchCompoundWhere,
  applyInclude,
  applySelect,
  applyOrderBy,
  type WhereInput,
  type IncludeInput,
  type SelectInput,
  type OrderByInput,
} from "./query";

// Contrato de argumentos que reciben los métodos del modelo mock (imita los args de
// Prisma). Todos opcionales: cada método lee solo lo que necesita (count → where,
// create → data, etc.). Los datos dinámicos se modelan como MockRecord.
type QueryArgs = {
  where?: WhereInput;
  data?: MockRecord;
  create?: MockRecord;
  update?: MockRecord;
  include?: IncludeInput;
  select?: SelectInput;
  orderBy?: OrderByInput;
  skip?: number;
  take?: number;
};

function makeModel(storeKey: keyof MockDB) {
  function records(): MockRecord[] {
    return getStore()[storeKey];
  }

  function findAll(args?: QueryArgs): MockRecord[] {
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
    findMany: async (args?: QueryArgs) => findAll(args),

    findFirst: async (args?: QueryArgs) => findAll(args)[0] ?? null,

    findUnique: async (args?: QueryArgs) => {
      const { where, include, select } = args ?? {};
      if (!where) return null;
      let row: MockRecord | null;
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

    create: async (args: QueryArgs) => {
      const { data, include, select } = args;
      const now = new Date().toISOString();
      const row: MockRecord = {
        id: newId(),
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      getStore()[storeKey].push(row);
      saveStore();
      let out = row;
      if (include) out = applyInclude(out, include, storeKey as string, getStore());
      if (select) out = applySelect(out, select);
      return out;
    },

    update: async (args: QueryArgs) => {
      const { where, data, include, select } = args;
      const arr = getStore()[storeKey];
      const idx = arr.findIndex((r) => matchWhere(r, where));
      if (idx === -1) throw new Error(`[mock] ${storeKey}.update: record not found`);
      arr[idx] = { ...arr[idx], ...data, updatedAt: new Date().toISOString() };
      saveStore();
      let out = arr[idx];
      if (include) out = applyInclude(out, include, storeKey as string, getStore());
      if (select) out = applySelect(out, select);
      return out;
    },

    updateMany: async (args?: QueryArgs) => {
      const { where, data } = args ?? {};
      const arr = getStore()[storeKey];
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

    delete: async (args: QueryArgs) => {
      const { where } = args;
      const arr = getStore()[storeKey];
      const idx = arr.findIndex((r) => matchWhere(r, where));
      if (idx === -1) throw new Error(`[mock] ${storeKey}.delete: record not found`);
      const [deleted] = arr.splice(idx, 1);
      saveStore();
      return deleted;
    },

    deleteMany: async (args?: QueryArgs) => {
      const { where } = args ?? {};
      const arr = getStore()[storeKey];
      const before = arr.length;
      const next = arr.filter((r) => !matchWhere(r, where));
      getStore()[storeKey] = next;
      saveStore();
      return { count: before - next.length };
    },

    upsert: async (args: QueryArgs) => {
      const { where, create, update, include, select } = args;
      const arr = getStore()[storeKey];
      const hasCompound = where
        ? Object.keys(where).some(
            (k) => k.includes("_") && typeof where[k] === "object" && where[k] !== null
          )
        : false;
      const idx = hasCompound
        ? arr.findIndex((r) => matchCompoundWhere(r, where!))
        : arr.findIndex((r) => matchWhere(r, where));

      let row: MockRecord;
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

    count: async (args?: QueryArgs) => {
      const { where } = args ?? {};
      return records().filter((r) => matchWhere(r, where)).length;
    },
  };
}

type MockModel = ReturnType<typeof makeModel>;
type MockClientModels = Record<string, MockModel>;

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
    $transaction: async (
      ops: Promise<unknown>[] | ((tx: MockClientModels) => Promise<unknown>)
    ) => {
      if (typeof ops === "function") return ops(createMockClient() as unknown as MockClientModels);
      return Promise.all(ops);
    },
    $disconnect: async () => {},
  };
}
