import { createMockClient } from "./mock/client";

// Seam intencional: el cliente mock y el real (PrismaClient) no comparten un tipo común
// importable — @prisma/client no se importa estáticamente para no romper cuando el cliente
// no está generado. Este es el único punto donde `any` es deliberado.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
