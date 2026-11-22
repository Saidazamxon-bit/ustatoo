"use client";

import { useRouter } from "next/navigation";
import { useRealtime } from "@/components/providers/session";

/** Buyurtma holati o‘zgarganda sahifani server ma'lumotlari bilan yangilaydi */
export function LiveRefresh({ orderId }: { orderId?: string }) {
  const router = useRouter();
  useRealtime((e) => {
    if (e.type === "order" && (!orderId || e.orderId === orderId)) router.refresh();
  });
  return null;
}
