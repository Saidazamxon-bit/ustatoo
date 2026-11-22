import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { getCurrentUser } from "@/server/auth";
import { AdminFilters } from "@/components/admin/admin-filters";
import { AdminAction } from "@/components/admin/admin-action";
import { Avatar, Badge } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import { dateShort, phone } from "@/lib/format";

export const metadata = { title: "Foydalanuvchilar" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; holat?: string }> }) {
  const { q, holat } = await searchParams;
  const me = await getCurrentUser();
  const where: Prisma.UserWhereInput = {
    ...(holat === "BLOCKED" ? { status: "BLOCKED" } : holat ? { role: holat } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q.replace(/\s/g, "") } }, { email: { contains: q, mode: "insensitive" } }] } : {}),
  };
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { master: { select: { id: true, verification: true } }, _count: { select: { clientOrders: true } } },
  });
  return (
    <div>
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Foydalanuvchilar</h1>
      <AdminFilters placeholder="Ism, telefon yoki email" statuses={[{ v: "CLIENT", l: "Mijozlar" }, { v: "MASTER", l: "Ustalar" }, { v: "ADMIN", l: "Adminlar" }, { v: "BLOCKED", l: "Bloklanganlar" }]} />
      {users.length ? (
        <div className="space-y-2.5">
          {users.map((u) => (
            <div key={u.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar src={u.avatar} name={u.name} size={44} />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-bold">
                    {u.name}
                    {u.status === "BLOCKED" && <Badge tone="danger">Bloklangan</Badge>}
                    {u.status === "DELETED" && <Badge>O‘chirilgan</Badge>}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {u.status === "DELETED" ? "—" : phone(u.phone)} · {dateShort(u.createdAt)} · {u._count.clientOrders} buyurtma
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={u.role === "ADMIN" ? "info" : u.role === "MASTER" ? "brand" : "neutral"}>{ROLE_LABELS[u.role as Role]}</Badge>
                {u.master && u.status !== "DELETED" && (
                  <a href={`/ustalar/${u.master.id}`} target="_blank" className="text-xs font-bold text-brand-600">
                    Profil ↗
                  </a>
                )}
                {u.id !== me?.id && u.status !== "DELETED" &&
                  (u.status === "ACTIVE" ? (
                    <AdminAction url={`/api/admin/users/${u.id}`} body={{ status: "BLOCKED" }} label="Bloklash" variant="danger" confirm={`${u.name} hisobini bloklaysizmi? U tizimga kira olmaydi.`} success="Foydalanuvchi bloklandi" />
                  ) : (
                    <AdminAction url={`/api/admin/users/${u.id}`} body={{ status: "ACTIVE" }} label="Blokdan chiqarish" variant="outline" success="Faollashtirildi" />
                  ))}
                {u.id !== me?.id && u.role !== "ADMIN" && u.status !== "DELETED" && (
                  <AdminAction url={`/api/admin/users/${u.id}`} body={{ role: "ADMIN" }} label="Admin qilish" variant="ghost" confirm={`${u.name} ga administrator huquqlarini berasizmi?`} success="Rol o‘zgartirildi" />
                )}
                {u.id !== me?.id && u.role === "ADMIN" && (
                  <AdminAction url={`/api/admin/users/${u.id}`} body={{ role: u.master ? "MASTER" : "CLIENT" }} label="Adminlikdan olish" variant="ghost" success="Rol o‘zgartirildi" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="Foydalanuvchi topilmadi" />
      )}
    </div>
  );
}
