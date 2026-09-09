import { PrismaClient } from '@prisma/client';

/**
 * Satu instance PrismaClient per proses.
 *
 * Di dev, hot reload Next membuat modul dievaluasi ulang berkali-kali. Tanpa
 * cache di globalThis, tiap reload membuka pool koneksi baru sampai Postgres
 * menolak ("too many connections").
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
