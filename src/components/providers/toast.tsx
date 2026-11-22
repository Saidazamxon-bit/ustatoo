"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Info, XCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info" | "notify";
type Toast = { id: number; tone: Tone; title: string; body?: string; href?: string };

const ToastCtx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

export function useToast() {
  const push = useContext(ToastCtx);
  return {
    success: (title: string, body?: string) => push({ tone: "success", title, body }),
    error: (title: string, body?: string) => push({ tone: "error", title, body }),
    info: (title: string, body?: string) => push({ tone: "info", title, body }),
    notify: (title: string, body?: string, href?: string) => push({ tone: "notify", title, body, href }),
  };
}

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-success" />,
  error: <XCircle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-info" />,
  notify: <Bell className="h-5 w-5 text-brand-500" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.tone === "error" ? 6000 : 4500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4 lg:top-auto lg:bottom-6 lg:right-6 lg:left-auto lg:items-end" aria-live="polite">
        {toasts.map((t) => {
          const content = (
            <>
              <span className="mt-0.5 shrink-0">{ICONS[t.tone]}</span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-ink">{t.title}</span>
                {t.body && <span className="block truncate text-sm text-muted">{t.body}</span>}
              </span>
            </>
          );
          const cls = cn("pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-surface px-4 py-3 shadow-[var(--shadow-lift)] animate-fade-up");
          return t.href ? (
            <Link key={t.id} href={t.href} className={cls}>
              {content}
            </Link>
          ) : (
            <div key={t.id} className={cls} role="status">
              {content}
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
