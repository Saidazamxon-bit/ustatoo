import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { PageHeader } from "@/components/layout/page-header";
import { NotificationList } from "./notification-list";

export const metadata: Metadata = { title: "Bildirishnomalar", robots: { index: false } };

export default async function NotificationsPage() {
  const user = await requirePageUser("/profil/bildirishnomalar");
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Bildirishnomalar" backHref="/profil" />
      <NotificationList initial={items.map((n) => ({ ...n, createdAt: n.createdAt.toISOString(), readAt: n.readAt?.toISOString() ?? null }))} />
    </div>
  );
}
