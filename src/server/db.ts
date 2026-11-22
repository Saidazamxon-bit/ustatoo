import "server-only";
import { PrismaClient } from "@prisma/client";

// Dev rejimida HMR paytida ulanishlar ko‘payib ketmasligi uchun yagona instance.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
