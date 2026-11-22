import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { subscribe } from "@/server/events";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Server-Sent Events: xabarlar, bildirishnomalar va buyurtma holatlari real vaqtda */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});

  const encoder = new TextEncoder();
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {
          cleanup();
        }
      };
      send({ type: "ready" });
      const unsubscribe = subscribe(user.id, send);
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          cleanup();
        }
      }, 25_000);
      cleanup = () => {
        clearInterval(ping);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      };
      req.signal.addEventListener("abort", () => cleanup());
    },
    cancel() {
      cleanup();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
