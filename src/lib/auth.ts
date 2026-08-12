import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import type { Role } from "@/generated/prisma/client";

// Módulo sin dependencias de `next/headers`: se puede importar tanto
// desde Route Handlers / Server Components como desde `src/proxy.ts`
// (que corre fuera del contexto de request de Next).

const rawSecret = process.env.JWT_SECRET;
if (!rawSecret) {
  throw new Error(
    "Falta la variable de entorno JWT_SECRET (ver .env.example).",
  );
}
const secretKey = new TextEncoder().encode(rawSecret);

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: Role;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload>(token, secretKey);
    if (!payload.userId || !payload.role) return null;
    return payload;
  } catch {
    return null;
  }
}
