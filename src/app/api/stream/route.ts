import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { eventsAfter, latestEventId } from "@/server/events";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const POLL_MS = 2000;
const LIFETIME_MS = 50_000; // serverless limitidan oldin yopamiz; brauzer o‘zi qayta ulanadi

/**
 * Server-Sent Events: xabarlar, bildirishnomalar va buyurtma holatlari.
 * Har bir hodisa `id:` bilan yuboriladi — qayta ulanishda brauzer `Last-Event-ID`
 * yuboradi va hech narsa yo‘qolmaydi.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  await db.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } }).catch(() => {});

  const header = Number(req.headers.get("last-event-id") || req.nextUrl.searchParams.get("after"));
  let lastId = Number.isFinite(header) && header > 0 ? header : await latestEventId(user.id);

  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    async start(controller) {
      const write = (s: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(s));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {}
      };
      req.signal.addEventListener("abort", close);
      write(`retry: 1500\n\n`);
      const started = Date.now();
      while (!closed && Date.now() - started < LIFETIME_MS) {
        try {
          const rows = await eventsAfter(user.id, lastId);
          for (const r of rows) {
            write(`id: ${r.id}\ndata: ${r.payload}\n\n`);
            lastId = r.id;
          }
          if (!rows.length) write(`: ping\n\n`);
        } catch (err) {
          console.error("[sse]", err);
        }
        await new Promise((res) => setTimeout(res, POLL_MS));
      }
      close();
    },
    cancel() {
      closed = true;
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
