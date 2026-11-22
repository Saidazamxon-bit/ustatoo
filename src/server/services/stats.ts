import "server-only";
import { db } from "../db";
import { getCommissionPercent } from "../settings";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Usta daromadlari: to‘langan buyurtmalar, komissiya ayirilgan holda */
export async function masterEarnings(masterId: string) {
  const commission = await getCommissionPercent();
  const paid = await db.order.findMany({
    where: { masterId, paymentStatus: "PAID" },
    select: { id: true, code: true, totalAmount: true, paymentMethod: true, updatedAt: true, completedAt: true, client: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });
  const net = (v: number) => Math.round(v * (1 - commission / 100));
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const months: { label: string; key: string; gross: number; net: number }[] = [];
  const labels = ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: labels[d.getMonth()], key: `${d.getFullYear()}-${d.getMonth()}`, gross: 0, net: 0 });
  }
  let total = 0;
  let thisMonth = 0;
  for (const o of paid) {
    const d = o.completedAt ?? o.updatedAt;
    total += o.totalAmount;
    if (d >= monthStart) thisMonth += o.totalAmount;
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) {
      m.gross += o.totalAmount;
      m.net += net(o.totalAmount);
    }
  }
  const pendingCash = await db.order.aggregate({
    where: { masterId, paymentStatus: { not: "PAID" }, status: { in: ["ACCEPTED", "IN_PROGRESS", "COMPLETED"] } },
    _sum: { totalAmount: true },
  });
  return {
    commission,
    total: net(total),
    gross: total,
    thisMonth: net(thisMonth),
    expected: net(pendingCash._sum.totalAmount ?? 0),
    months,
    transactions: paid.slice(0, 30).map((o) => ({ ...o, net: net(o.totalAmount) })),
  };
}

export async function masterDashboard(masterId: string) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today.getTime() + 86_400_000);
  const [byStatus, todayJobs, upcoming, profile, earnings] = await Promise.all([
    db.order.groupBy({ by: ["status"], where: { masterId }, _count: { _all: true } }),
    db.order.count({ where: { masterId, scheduledAt: { gte: today, lt: tomorrow }, status: { in: ["ACCEPTED", "IN_PROGRESS"] } } }),
    db.order.findMany({
      where: { masterId, status: { in: ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"] } },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: { items: { select: { title: true, quantity: true } }, client: { select: { name: true, avatar: true } }, master: { select: { id: true, specialty: true, coverImage: true, user: { select: { name: true, avatar: true } } } } },
    }),
    db.masterProfile.findUnique({ where: { id: masterId }, select: { rating: true, reviewCount: true, completedJobs: true, verification: true, isAvailable: true, popularity: true } }),
    masterEarnings(masterId),
  ]);
  const count = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  return {
    newCount: count("NEW") + count("PENDING"),
    activeCount: count("ACCEPTED") + count("IN_PROGRESS"),
    completedCount: count("COMPLETED"),
    todayJobs,
    upcoming,
    profile,
    earnings,
  };
}

export async function adminStats() {
  const now = new Date();
  const from = startOfDay(new Date(now.getTime() - 13 * 86_400_000));
  const [users, clients, masters, pendingVerification, orders, ordersByStatus, revenue, openComplaints, recentUsers, recentOrders, categories] =
    await Promise.all([
      db.user.count(),
      db.user.count({ where: { role: "CLIENT" } }),
      db.user.count({ where: { role: "MASTER" } }),
      db.masterProfile.count({ where: { verification: "PENDING" } }),
      db.order.count(),
      db.order.groupBy({ by: ["status"], _count: { _all: true } }),
      db.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
      db.complaint.count({ where: { status: "OPEN" } }),
      db.user.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true } }),
      db.order.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true, totalAmount: true } }),
      db.category.findMany({ select: { name: true, _count: { select: { masters: true, services: true } } }, orderBy: { sortOrder: "asc" } }),
    ]);
  const days: { label: string; users: number; orders: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(from.getTime() + i * 86_400_000);
    const next = new Date(d.getTime() + 86_400_000);
    days.push({
      label: `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, "0")}`,
      users: recentUsers.filter((u) => u.createdAt >= d && u.createdAt < next).length,
      orders: recentOrders.filter((o) => o.createdAt >= d && o.createdAt < next).length,
    });
  }
  const commission = await getCommissionPercent();
  const gross = revenue._sum.totalAmount ?? 0;
  return {
    users,
    clients,
    masters,
    pendingVerification,
    orders,
    ordersByStatus: Object.fromEntries(ordersByStatus.map((o) => [o.status, o._count._all])) as Record<string, number>,
    gross,
    platformIncome: Math.round((gross * commission) / 100),
    openComplaints,
    days,
    categories: categories.map((c) => ({ name: c.name, masters: c._count.masters, services: c._count.services })),
  };
}
