import fs from "fs";
import path from "path";
import { seedData, type MockDB } from "./seed";

const DB_FILE = path.resolve(process.cwd(), "data", "mock-db.json");

const g = globalThis as unknown as { _mockStore?: MockDB };

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function getStore(): MockDB {
  if (g._mockStore) return g._mockStore;

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    g._mockStore = JSON.parse(raw) as MockDB;
  } catch {
    g._mockStore = deepClone(seedData);
  }

  return g._mockStore!;
}

export function saveStore(): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(g._mockStore, null, 2), "utf-8");
  } catch (e) {
    console.warn("[mock] Could not persist store:", e);
  }
}

export function resetStore(): void {
  g._mockStore = deepClone(seedData);
  saveStore();
}

let idCounter = Date.now();
export function newId(): string {
  return `mock-${(idCounter++).toString(36)}`;
}
