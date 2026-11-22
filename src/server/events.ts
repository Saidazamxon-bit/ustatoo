import "server-only";
import { EventEmitter } from "node:events";

/**
 * Real vaqt hodisalari shinasi (SSE orqali brauzerga uzatiladi).
 * Bitta server instance uchun xotirada ishlaydi. Bir nechta instance
 * (gorizontal masshtab) uchun bu modulni Redis Pub/Sub bilan almashtirish kifoya —
 * publish/subscribe interfeysi o‘zgarmaydi.
 */
export type RealtimeEvent =
  | { type: "message"; conversationId: string; message: unknown }
  | { type: "message_read"; conversationId: string; readerId: string }
  | { type: "notification"; notification: { id: string; title: string; body: string; link: string | null; type: string } }
  | { type: "order"; orderId: string; status: string }
  | { type: "typing"; conversationId: string; userId: string };

const g = globalThis as unknown as { __utBus?: EventEmitter };
const bus = g.__utBus ?? new EventEmitter();
bus.setMaxListeners(0);
g.__utBus = bus;

export function publish(userId: string, event: RealtimeEvent) {
  bus.emit(`u:${userId}`, event);
}

export function subscribe(userId: string, listener: (e: RealtimeEvent) => void) {
  const key = `u:${userId}`;
  bus.on(key, listener);
  return () => bus.off(key, listener);
}
