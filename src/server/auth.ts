import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { forbidden, unauthorized } from "./errors";
import { SESSION_COOKIE, type Role } from "@/lib/constants";
import { signSession, verifySession, SESSION_MAX_AGE } from "./session";

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSession(user: { id: string; role: string }) {
  const token = await signSession({ sub: user.id, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "true",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

const userSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  role: true,
  status: true,
  avatar: true,
  region: true,
  district: true,
  address: true,
  notifyOrders: true,
  notifyMessages: true,
  notifyPromos: true,
  createdAt: true,
  master: { select: { id: true, verification: true, categoryId: true } },
} as const;

/** Joriy foydalanuvchi (bitta so‘rov davomida keshlanadi). Bloklangan bo‘lsa null. */
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifySession(token);
  if (!payload) return null;
  const user = await db.user.findUnique({ where: { id: payload.sub }, select: userSelect });
  if (!user || user.status !== "ACTIVE") return null;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** API uchun: foydalanuvchi bo‘lmasa 401 */
export async function requireUser(roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw unauthorized();
  if (roles && !roles.includes(user.role as Role)) throw forbidden();
  return user;
}

/** API uchun: usta profili bor foydalanuvchi */
export async function requireMaster() {
  const user = await requireUser(["MASTER"]);
  if (!user.master) throw forbidden("Usta profili topilmadi");
  return { user, masterId: user.master.id };
}

/** Sahifalar uchun: kirmagan bo‘lsa login sahifasiga yo‘naltiradi */
export async function requirePageUser(next: string, roles?: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/kirish?next=${encodeURIComponent(next)}`);
  if (roles && !roles.includes(user.role as Role)) redirect("/?ruxsat=yoq");
  return user;
}
