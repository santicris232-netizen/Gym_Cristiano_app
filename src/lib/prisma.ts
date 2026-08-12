import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// Singleton de PrismaClient: evita abrir una conexión nueva en cada
// hot-reload durante desarrollo.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// process.env.DATABASE_URL funciona tanto en Node (dev/local) como en
// el Worker de Cloudflare, siempre que compatibility_date en
// wrangler.jsonc sea >= 2025-04-01 (ver wrangler.jsonc) — Cloudflare
// vuelca los bindings/secrets configurados a process.env automáticamente.
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
