"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mobilda pastdan chiquvchi "sheet", kompyuterda markazlashgan oyna */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Yopish" className="absolute inset-0 bg-black/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
      <div
        className={cn(
          "relative flex max-h-[92dvh] w-full flex-col rounded-t-[2rem] bg-cream shadow-[var(--shadow-lift)] animate-slide-up sm:max-w-lg sm:rounded-[2rem] sm:animate-pop",
          className,
        )}
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-line sm:hidden" />
        <div className="flex items-center justify-between px-5 pb-2 pt-3 sm:pt-5">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} aria-label="Yopish" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-soft)]">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-line bg-surface/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:rounded-b-[2rem]">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
