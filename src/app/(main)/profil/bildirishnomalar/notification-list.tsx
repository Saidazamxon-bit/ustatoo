"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CreditCard, MessageCircle, ShoppingBag, Star, Trash2, Info } from "lucide-react";
import { api } from "@/lib/api-client";
import { useRealtime, useSession } from "@/components/providers/session";
import { EmptyState } from "@/components/ui/states";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

type N = { id: string; type: string; title: string; body: string; link: string | null; readAt: string | null; createdAt: string };

const ICON: Record<string, React.ElementType> = { ORDER: ShoppingBag, MESSAGE: MessageCircle, REVIEW: Star, PAYMENT: CreditCard, SYSTEM: Info };

export function NotificationList({ initial }: { initial: N[] }) {
  const [items, setItems] = useState(initial);
  const router = useRouter();
  const { refreshCounts } = useSession();

  useRealtime((e) => {
    if (e.type === "notification" && e.notification) {
      const n = e.notification;
      setItems((prev) => [{ ...n, readAt: null, createdAt: new Date().toISOString() }, ...prev]);
    }
  });

  const open = async (n: N) => {
    if (!n.readAt) {
      setItems((p) => p.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x)));
      api.patch(`/api/notifications/${n.id}`).then(refreshCounts).catch(() => {});
    }
    if (n.link) router.push(n.link);
  };

  const readAll = async () => {
    await api.post("/api/notifications");
    setItems((p) => p.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    refreshCounts();
  };

  const remove = async (id: string) => {
    setItems((p) => p.filter((x) => x.id !== id));
    await api.delete(`/api/notifications/${id}`).catch(() => {});
    refreshCounts();
  };

  if (!items.length) return <EmptyState icon={<Bell className="h-7 w-7" />} title="Bildirishnomalar yo‘q" description="Buyurtma, xabar va to‘lovlar haqidagi yangiliklar shu yerda paydo bo‘ladi." />;

  const unread = items.filter((n) => !n.readAt).length;
  return (
    <div>
      {unread > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-muted">{unread} ta o‘qilmagan</p>
          <Button variant="ghost" size="sm" onClick={readAll} icon={<CheckCheck className="h-4 w-4" />}>
            Barchasini o‘qildi deb belgilash
          </Button>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((n) => {
          const Icon = ICON[n.type] ?? Bell;
          return (
            <li key={n.id} className={cn("group flex items-start gap-3 rounded-[1.4rem] p-3.5 transition animate-fade-up", n.readAt ? "bg-surface/60" : "bg-surface shadow-[var(--shadow-soft)]")}>
              <button onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", n.readAt ? "bg-cream text-muted" : "bg-brand-50 text-brand-500")}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className={cn("truncate", n.readAt ? "font-semibold" : "font-bold")}>{n.title}</span>
                    {!n.readAt && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                  </span>
                  <span className="block text-sm text-ink-2">{n.body}</span>
                  <span suppressHydrationWarning className="text-xs text-muted">{timeAgo(n.createdAt)}</span>
                </span>
              </button>
              <button onClick={() => remove(n.id)} aria-label="O‘chirish" className="rounded-full p-2 text-muted opacity-60 transition hover:bg-red-50 hover:text-danger group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
