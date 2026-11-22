import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { AdminFilters } from "@/components/admin/admin-filters";
import { StatusBadge } from "@/components/orders/status-badge";
import { Badge } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { dateTime, money } from "@/lib/format";

export const metadata = { title: "Buyurtmalar" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  const { q, holat } = await searchParams;
  const where: Prisma.OrderWhereInput = {
    ...(holat ? { status: holat } : {}),
    ...(q ? { OR: [{ code: { contains: q.toUpperCase() } }, { client: { name: { contains: q, mode: "insensitive" } } }, { master: { user: { name: { contains: q, mode: "insensitive" } } } }] } : {}),
  };
  const [orders, total] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { client: { select: { name: true } }, master: { select: { user: { select: { name: true } } } } } }),
    db.order.aggregate({ where, _sum: { totalAmount: true }, _count: { _all: true } }),
  ]);
  return (
    <div>
      <h1 className="mb-1 text-[28px] font-bold tracking-tight">Buyurtmalar</h1>
      <p className="mb-5 text-muted">{total._count._all} ta · jami {money(total._sum.totalAmount ?? 0)}</p>
      <AdminFilters placeholder="Kod, mijoz yoki usta" statuses={ORDER_STATUSES.map((s) => ({ v: s, l: ORDER_STATUS_LABELS[s] }))} />
      {orders.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-4">Kod</th>
                <th className="p-4">Mijoz</th>
                <th className="p-4">Usta</th>
                <th className="p-4">Vaqt</th>
                <th className="p-4">Summa</th>
                <th className="p-4">To‘lov</th>
                <th className="p-4">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="transition hover:bg-cream/60">
                  <td className="p-4 font-bold"><Link href={`/buyurtmalar/${o.id}`} className="text-brand-600 hover:underline">{o.code}</Link></td>
                  <td className="p-4">{o.client.name}</td>
                  <td className="p-4">{o.master.user.name}</td>
                  <td className="p-4 text-muted">{dateTime(o.scheduledAt)}</td>
                  <td className="p-4 font-semibold">{money(o.totalAmount)}</td>
                  <td className="p-4"><Badge tone={o.paymentStatus === "PAID" ? "success" : "neutral"}>{PAYMENT_STATUS_LABELS[o.paymentStatus]}</Badge></td>
                  <td className="p-4"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="Buyurtmalar topilmadi" />
      )}
    </div>
  );
}
