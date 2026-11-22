"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, CheckCheck, MessageCircle } from "lucide-react";
import type { ConversationListItem } from "@/server/services/chat";
import { Avatar } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { ButtonLink } from "@/components/ui/button";
import { useRealtime, useSession } from "@/components/providers/session";
import { timeAgo } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Item = Omit<ConversationListItem, "lastMessageAt" | "lastMessage" | "other"> & {
  lastMessageAt: string | Date;
  lastMessage: { text: string; createdAt: string | Date; mine: boolean; read: boolean } | null;
  other: { id: string; name: string; avatar: string | null; subtitle: string; lastSeenAt: string | Date };
};

export function ConversationList({ initial, compact }: { initial: Item[]; compact?: boolean }) {
  const [items, setItems] = useState(initial);
  const pathname = usePathname();
  const { user } = useSession();

  useRealtime((e) => {
    if (e.type === "message" && e.message) {
      const msg = e.message;
      setItems((prev) => {
        const idx = prev.findIndex((c) => c.id === e.conversationId);
        if (idx === -1) return prev; // yangi suhbat — sahifa yangilanganda paydo bo‘ladi
        const c = prev[idx];
        const mine = msg.senderId === user?.id;
        const isOpen = pathname === `/xabarlar/${c.id}`;
        const updated: Item = {
          ...c,
          lastMessageAt: msg.createdAt,
          lastMessage: { text: msg.text ?? "📷 Rasm", createdAt: msg.createdAt, mine, read: false },
          unread: mine || isOpen ? c.unread : c.unread + 1,
        };
        return [updated, ...prev.filter((_, i) => i !== idx)];
      });
    }
    if (e.type === "message_read") {
      setItems((prev) => prev.map((c) => (c.id === e.conversationId && c.lastMessage?.mine ? { ...c, lastMessage: { ...c.lastMessage, read: true } } : c)));
    }
  });

  if (!items.length) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-7 w-7" />}
        title="Hali xabarlar yo‘q"
        description="Usta profilidagi “Xabar yozish” tugmasi orqali suhbat boshlang."
        action={<ButtonLink href="/kategoriyalar">Usta topish</ButtonLink>}
      />
    );
  }

  return (
    <ul className={cn("space-y-2", compact && "space-y-1")}>
      {items.map((c) => {
        const active = pathname === `/xabarlar/${c.id}`;
        const online = Date.now() - new Date(c.other.lastSeenAt).getTime() < 5 * 60_000;
        return (
          <li key={c.id}>
            <Link
              href={`/xabarlar/${c.id}`}
              className={cn(
                "flex items-center gap-3 rounded-[1.4rem] p-3 transition",
                active ? "bg-brand-50 ring-1 ring-brand-200" : "bg-white shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-lift)]",
              )}
            >
              <span className="relative">
                <Avatar src={c.other.avatar} name={c.other.name} size={52} />
                {online && <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate font-bold">{c.other.name}</span>
                  {c.lastMessage && <span className="shrink-0 text-xs text-muted">{timeAgo(c.lastMessage.createdAt)}</span>}
                </span>
                {c.order && (
                  <span className="block truncate text-[11px] font-semibold text-brand-600">
                    {c.order.code} · {ORDER_STATUS_LABELS[c.order.status as OrderStatus]}
                  </span>
                )}
                <span className="flex items-center justify-between gap-2">
                  <span className={cn("flex min-w-0 items-center gap-1 text-sm", c.unread ? "font-semibold text-ink" : "text-muted")}>
                    {c.lastMessage?.mine && (c.lastMessage.read ? <CheckCheck className="h-4 w-4 shrink-0 text-brand-500" /> : <Check className="h-4 w-4 shrink-0" />)}
                    <span className="truncate">{c.lastMessage?.text ?? c.other.subtitle}</span>
                  </span>
                  {c.unread > 0 && <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">{c.unread}</span>}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
