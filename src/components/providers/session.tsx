"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "./toast";

export type SessionUser = {
  id: string;
  name: string;
  avatar: string | null;
  role: "CLIENT" | "MASTER" | "ADMIN";
  masterId: string | null;
  region: string | null;
  district: string | null;
};

export type RealtimeMessage = {
  type: string;
  conversationId?: string;
  message?: { id: string; conversationId: string; senderId: string; text: string | null; image: string | null; readAt: string | null; createdAt: string };
  readerId?: string;
  orderId?: string;
  status?: string;
  notification?: { id: string; title: string; body: string; link: string | null; type: string };
};

type Ctx = {
  user: SessionUser | null;
  unreadMessages: number;
  unreadNotifications: number;
  connected: boolean;
  refreshCounts: () => void;
  subscribe: (fn: (e: RealtimeMessage) => void) => () => void;
};

const SessionCtx = createContext<Ctx>({
  user: null,
  unreadMessages: 0,
  unreadNotifications: 0,
  connected: false,
  refreshCounts: () => {},
  subscribe: () => () => {},
});

export const useSession = () => useContext(SessionCtx);

/** Real vaqt hodisalariga obuna bo‘lish uchun hook */
export function useRealtime(fn: (e: RealtimeMessage) => void) {
  const { subscribe } = useSession();
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => subscribe((e) => ref.current(e)), [subscribe]);
}

export function SessionProvider({
  user,
  initialCounts,
  children,
}: {
  user: SessionUser | null;
  initialCounts: { messages: number; notifications: number };
  children: ReactNode;
}) {
  const [unreadMessages, setUnreadMessages] = useState(initialCounts.messages);
  const [unreadNotifications, setUnreadNotifications] = useState(initialCounts.notifications);
  const [connected, setConnected] = useState(false);
  const listeners = useRef(new Set<(e: RealtimeMessage) => void>());
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const toast = useToast();
  const userId = user?.id ?? null;
  const toastRef = useRef(toast);
  toastRef.current = toast;

  const refreshCounts = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      const json = await res.json();
      if (json.data?.user) {
        setUnreadMessages(json.data.unreadMessages);
        setUnreadNotifications(json.data.unreadNotifications);
      }
    } catch {
      /* tarmoq xatosi — keyingi safar yangilanadi */
    }
  }, []);

  // Sahifa almashganda hisoblagichlarni yangilash (masalan, xabarlar o‘qilgandan keyin)
  useEffect(() => {
    if (userId) refreshCounts();
  }, [pathname, userId, refreshCounts]);

  useEffect(() => {
    if (!userId) return;
    let es: EventSource | null = null;
    let retry = 1000;
    let timer: ReturnType<typeof setTimeout>;
    let closed = false;

    const connect = () => {
      es = new EventSource("/api/stream");
      es.onopen = () => {
        setConnected(true);
        retry = 1000;
      };
      es.onmessage = (ev) => {
        let data: RealtimeMessage;
        try {
          data = JSON.parse(ev.data);
        } catch {
          return;
        }
        if (data.type === "notification" && data.notification) {
          setUnreadNotifications((n) => n + 1);
          const n = data.notification;
          if (n.type !== "MESSAGE" || !pathRef.current.startsWith("/xabarlar")) {
            toastRef.current.notify(n.title, n.body, n.link ?? undefined);
          }
        }
        if (data.type === "message" && data.message && data.message.senderId !== userId) {
          if (pathRef.current !== `/xabarlar/${data.conversationId}`) setUnreadMessages((n) => n + 1);
        }
        listeners.current.forEach((fn) => fn(data));
      };
      es.onerror = () => {
        setConnected(false);
        es?.close();
        if (!closed) {
          timer = setTimeout(connect, retry);
          retry = Math.min(retry * 2, 30_000);
        }
      };
    };
    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      es?.close();
    };
  }, [userId]);

  const subscribe = useCallback((fn: (e: RealtimeMessage) => void) => {
    listeners.current.add(fn);
    return () => {
      listeners.current.delete(fn);
    };
  }, []);

  return (
    <SessionCtx.Provider value={{ user, unreadMessages, unreadNotifications, connected, refreshCounts, subscribe }}>
      {children}
    </SessionCtx.Provider>
  );
}
