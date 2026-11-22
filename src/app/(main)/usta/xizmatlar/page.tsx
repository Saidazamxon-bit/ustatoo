import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { db } from "@/server/db";
import { ServicesManager } from "./services-manager";

export const metadata: Metadata = { title: "Xizmatlarni boshqarish", robots: { index: false } };

export default async function MasterServicesPage() {
  const user = await requirePageUser("/usta/xizmatlar", ["MASTER"]);
  const [services, m] = await Promise.all([
    db.service.findMany({ where: { masterId: user.master!.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { orderItems: true } } } }),
    db.masterProfile.findUniqueOrThrow({ where: { id: user.master!.id }, select: { category: { select: { image: true } } } }),
  ]);
  return (
    <div className="space-y-5 pt-4 lg:pt-0">
      <ServicesManager
        fallbackImage={m.category.image}
        initial={services.map((s) => ({ id: s.id, title: s.title, description: s.description, image: s.image, price: s.price, priceUnit: s.priceUnit, durationText: s.durationText, isActive: s.isActive, orders: s._count.orderItems }))}
      />
    </div>
  );
}
