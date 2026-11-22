"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Admin ro‘yxatlari uchun qidiruv va holat filtrlari (URL orqali) */
export function AdminFilters({ statuses, param = "holat", placeholder = "Qidirish…", search = true }: { statuses?: { v: string; l: string }[]; param?: string; placeholder?: string; search?: boolean }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const go = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    v ? next.set(k, v) : next.delete(k);
    router.push(`${pathname}?${next}`);
  };
  const current = sp.get(param) ?? "";
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
      {search && (
        <form onSubmit={(e) => { e.preventDefault(); go("q", q.trim()); }} className="flex h-11 items-center gap-2 rounded-full bg-surface px-4 shadow-[var(--shadow-soft)] lg:w-80">
          <Search className="h-4 w-4 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Qidirish" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </form>
      )}
      {statuses && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {[{ v: "", l: "Barchasi" }, ...statuses].map((s) => (
            <button key={s.v} onClick={() => go(param, s.v)} className={cn("chip shrink-0", current === s.v ? "bg-ink text-cream shadow-none" : "hover:text-brand-600")}>
              {s.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
