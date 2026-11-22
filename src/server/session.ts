// JWT sessiya tokenlari. Edge (middleware) va Node muhitlarida ishlaydi — "server-only" ishlatilmaydi.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 kun

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET kamida 32 belgi bo‘lishi shart");
    return new TextEncoder().encode("dev-only-insecure-secret-please-change-me-0000");
  }
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; role: string };

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: String(payload.role ?? "CLIENT") };
  } catch {
    return null;
  }
}
