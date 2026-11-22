"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/providers/toast";

export function SortChips({ basePath }: { basePath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("saralash") ?? "popular";
  const toast = useToast();

  const apply = (value: string, extra?: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString());
    next.set("saralash", value);
    next.delete("sahifa");
    if (value !== "near") {
      next.delete("lat");
      next.delete("lng");
    }
    for (const [k, v] of Object.entries(extra ?? {})) next.set(k, v);
    router.push(`${basePath ?? pathname}?${next.toString()}`, { scroll: false });
  };

  const choose = (value: string) => {
    if (value !== "near") return apply(value);
    // "Eng yaqin": brauzer joylashuvidan foydalanamiz, ruxsat bo‘lmasa hudud markazidan
    if (!navigator.geolocation) return apply("near");
    navigator.geolocation.getCurrentPosition(
      (pos) => apply("near", { lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }),
      () => {
        toast.info("Joylashuv aniqlanmadi", "Tanlangan hudud markazidan masofa hisoblanadi");
        apply("near");
      },
      { timeout: 6000, maximumAge: 600_000 },
    );
  };

  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {SORT_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => choose(o.value)}
          aria-pressed={current === o.value}
          className={cn(
            "chip shrink-0",
            current === o.value ? "bg-ink text-white shadow-none" : "hover:text-brand-600",
          )}
        >
          {o.value === "near" && <Navigation className="h-3.5 w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
