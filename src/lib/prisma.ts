import { createMockClient } from "./mock/client";

const g = globalThis as unknown as { prisma?: any };

function createRealClient() {
  // Dynamic require so the import doesn't crash when @prisma/client isn't generated
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@prisma/client");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma =
  g.prisma ??
  (process.env.MOCK_MODE === "true" ? createMockClient() : createRealClient());

if (process.env.NODE_ENV !== "production") g.prisma = prisma;

export default prisma;
