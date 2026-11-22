"use client";

import { Banknote, Check, CreditCard, Wallet } from "lucide-react";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@/lib/constants";
import { cn } from "@/lib/utils";

const META: Record<PaymentMethod, { hint: string; color: string; icon: React.ReactNode }> = {
  CLICK: { hint: "Click ilovasi yoki karta orqali", color: "bg-[#0096FF]", icon: <Wallet className="h-5 w-5" /> },
  PAYME: { hint: "Payme ilovasi orqali", color: "bg-[#33CCCC]", icon: <Wallet className="h-5 w-5" /> },
  UZCARD: { hint: "Uzcard bank kartasi", color: "bg-[#1A4FA0]", icon: <CreditCard className="h-5 w-5" /> },
  HUMO: { hint: "Humo bank kartasi", color: "bg-[#00A651]", icon: <CreditCard className="h-5 w-5" /> },
  CASH: { hint: "Ish yakunida ustaga naqd", color: "bg-ink", icon: <Banknote className="h-5 w-5" /> },
};

/** Referensning o‘ng ekranidagi kabi to‘lov usuli kartalari */
export function PaymentMethods({ value, onChange }: { value: PaymentMethod; onChange: (m: PaymentMethod) => void }) {
  return (
    <div className="space-y-2.5" role="radiogroup" aria-label="To‘lov usuli">
      {PAYMENT_METHODS.map((m) => {
        const on = value === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m)}
            className={cn(
              "flex w-full items-center gap-3.5 rounded-2xl border p-3.5 text-left transition active:scale-[0.99]",
              on ? "border-brand-400 bg-brand-50 shadow-[var(--shadow-soft)]" : "border-transparent bg-white shadow-[var(--shadow-soft)] hover:border-brand-200",
            )}
          >
            <span className={cn("flex h-11 w-14 items-center justify-center rounded-xl text-white", META[m].color)}>
              {m === "CLICK" || m === "PAYME" || m === "UZCARD" || m === "HUMO" ? (
                <span className="text-[11px] font-black tracking-wide">{PAYMENT_METHOD_LABELS[m].toUpperCase()}</span>
              ) : (
                META[m].icon
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{PAYMENT_METHOD_LABELS[m]}</span>
              <span className="block truncate text-[13px] text-muted">{META[m].hint}</span>
            </span>
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2 transition", on ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-cream")}>
              {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
