import "server-only";
import { db } from "./db";

/**
 * Real vaqt hodisalari. Hodisa `RealtimeEvent` jadvaliga yoziladi ("outbox"),
 * `/api/stream` (SSE) esa foydalanuvchining yangi hodisalarini shu jadvaldan o‘qiydi.
 * Shu sababli bir nechta server instance (Vercel serverless) bo‘lsa ham hodisalar
 * to‘g‘ri yetib boradi. Yuqori yuklama uchun keyinchalik Redis Pub/Sub bilan
 * almashtirish mumkin — publish() interfeysi o‘zgarmaydi.
 */
export type RealtimeEvent =
  | { type: "message"; conversationId: string; message: unknown }
  | { type: "message_read"; conversationId: string; readerId: string }
  | { type: "notification"; notification: { id: string; title: string; body: string; link: string | null; type: string } }
  | { type: "order"; orderId: string; status: string };

const RETENTION_MS = 60 * 60 * 1000; // hodisalar 1 soat saqlanadi

export async function publish(userId: string, event: RealtimeEvent) {
  try {
    await db.realtimeEvent.create({ data: { userId, payload: JSON.stringify(event) } });
    // Vaqti-vaqti bilan eski hodisalarni tozalash
    if (Math.random() < 0.02) {
      await db.realtimeEvent.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - RETENTION_MS) } } });
    }
  } catch (err) {
    // Real vaqt yetkazilmasa ham asosiy amal (buyurtma, xabar) bekor qilinmasin
    console.error("[realtime] publish xatosi", err);
  }
}

export async function latestEventId(userId: string): Promise<number> {
  const last = await db.realtimeEvent.findFirst({ where: { userId }, orderBy: { id: "desc" }, select: { id: true } });
  return last?.id ?? 0;
}

export async function eventsAfter(userId: string, afterId: number) {
  return db.realtimeEvent.findMany({
    where: { userId, id: { gt: afterId } },
    orderBy: { id: "asc" },
    take: 50,
    select: { id: true, payload: true },
  });
}
