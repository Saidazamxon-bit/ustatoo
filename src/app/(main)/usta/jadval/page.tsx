import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { ScheduleForm } from "./schedule-form";
import { StatusBadge } from "@/components/orders/status-badge";
import { WEEKDAYS } from "@/lib/constants";
import { money, time } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ish jadvali", robots: { index: false } };

export default async function SchedulePage() {
  const user = await requirePageUser("/usta/jadval", ["MASTER"]);
  const masterId = user.master!.id;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime() + 14 * 86_400_000);
  const [m, orders] = await Promise.all([
    db.masterProfile.findUniqueOrThrow({ where: { id: masterId }, select: { workDays: true, workStart: true, workEnd: true } }),
    db.order.findMany({
      where: { masterId, scheduledAt: { gte: start, lt: end }, status: { in: ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      orderBy: { scheduledAt: "asc" },
      include: { client: { select: { name: true } }, items: { select: { title: true } } },
    }),
  ]);
  const workDays = m.workDays.split(",").map(Number);
  const days = Array.from({ length: 14 }, (_, i) => new Date(start.getTime() + i * 86_400_000));

  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <h1 className="text-[26px] font-bold tracking-tight">Ish jadvali</h1>
      <ScheduleForm initial={{ workDays, workStart: m.workStart, workEnd: m.workEnd }} />
      <section>
        <h2 className="section-title mb-3">Keyingi 14 kun</h2>
        <div className="space-y-2.5">
          {days.map((d) => {
            const wd = d.getDay() === 0 ? 7 : d.getDay();
            const working = workDays.includes(wd);
            const dayOrders = orders.filter((o) => o.scheduledAt.toDateString() === d.toDateString());
            return (
              <div key={d.toISOString()} className={cn("card flex gap-4 p-4", !working && "opacity-60")}>
                <div className={cn("flex w-14 shrink-0 flex-col items-center justify-center rounded-2xl py-2", dayOrders.length ? "bg-brand-500 text-white" : "bg-cream")}>
                  <span className="text-xs font-semibold">{WEEKDAYS[wd - 1].short}</span>
                  <span className="text-xl font-extrabold">{d.getDate()}</span>
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  {!working && <p className="pt-3 text-sm text-muted">Dam olish kuni</p>}
                  {working && !dayOrders.length && <p className="pt-3 text-sm text-muted">Bo‘sh · {m.workStart}–{m.workEnd}</p>}
                  {dayOrders.map((o) => (
                    <Link key={o.id} href={`/buyurtmalar/${o.id}`} className="flex items-center gap-2.5 rounded-xl bg-cream px-3 py-2 text-sm transition hover:bg-brand-50">
                      <span className="font-bold">{time(o.scheduledAt)}</span>
                      <span className="min-w-0 flex-1 truncate">{o.client.name} · {o.items.map((i) => i.title).join(", ")}</span>
                      <span className="hidden font-semibold sm:inline">{money(o.totalAmount)}</span>
                      <StatusBadge status={o.status} />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
