"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, ShoppingBag } from "lucide-react";
import { SmartImage } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/utils";
import { money, priceWithUnit } from "@/lib/format";
import { useSession } from "@/components/providers/session";

type Svc = { id: string; title: string; description: string; image: string | null; price: number; priceUnit: string; durationText: string };

/**
 * Usta xizmatlari ro‘yxati: bir nechta xizmatni tanlash va buyurtmaga o‘tish.
 * Mobilda pastki "sticky" panel, kompyuterda yon kartada ko‘rinadi.
 */
export function ServiceSelector({
  masterId,
  services,
  fallbackImage,
  preselected,
  favorite,
  isSelf,
}: {
  masterId: string;
  services: Svc[];
  fallbackImage: string;
  preselected?: string;
  favorite: boolean;
  isSelf: boolean;
}) {
  const [selected, setSelected] = useState<string[]>(preselected && services.some((s) => s.id === preselected) ? [preselected] : []);
  const router = useRouter();
  const { user } = useSession();
  const total = useMemo(() => services.filter((s) => selected.includes(s.id)).reduce((a, s) => a + s.price, 0), [selected, services]);
  const toggle = (id: string) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const order = () => {
    const ids = selected.length ? selected : services.slice(0, 1).map((s) => s.id);
    const target = `/buyurtma/yangi?usta=${masterId}&xizmatlar=${ids.join(",")}`;
    router.push(user ? target : `/kirish?next=${encodeURIComponent(target)}`);
  };

  return (
    <>
      <div className="space-y-3">
        {services.map((s) => {
          const on = selected.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggle(s.id)}
              aria-pressed={on}
              className={cn(
                "card flex w-full gap-3.5 p-3 text-left transition active:scale-[0.99]",
                on ? "ring-2 ring-brand-400 bg-brand-50/40" : "hover:shadow-[var(--shadow-lift)]",
              )}
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:h-24 sm:w-24">
                <SmartImage src={s.image ?? fallbackImage} alt={s.title} sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold leading-tight">{s.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-muted">{s.description}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-ink-2">
                    <Clock className="h-3.5 w-3.5 text-brand-500" /> {s.durationText}
                  </span>
                  <span className="font-extrabold text-brand-600">{priceWithUnit(s.price, s.priceUnit)}</span>
                </div>
              </div>
              <span className={cn("mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition", on ? "border-brand-500 bg-brand-500 text-white" : "border-line")}>
                {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {!isSelf && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(0.9rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="glass mx-auto flex max-w-xl items-center gap-3 rounded-full p-2 shadow-[var(--shadow-lift)] ring-1 ring-black/[0.03]">
            <FavoriteButton masterId={masterId} initial={favorite} className="bg-surface" />
            <Button size="lg" className="h-12 flex-1" onClick={order} icon={<ShoppingBag className="h-5 w-5" />}>
              {selected.length ? `Buyurtma · ${money(total)}` : "Buyurtma berish"}
            </Button>
          </div>
        </div>
      )}
      <DesktopOrderCta show={!isSelf} count={selected.length} total={total} onOrder={order} />
    </>
  );
}

function DesktopOrderCta({ show, count, total, onOrder }: { show: boolean; count: number; total: number; onOrder: () => void }) {
  if (!show) return null;
  return (
    <div className="mt-4 hidden items-center justify-between rounded-2xl bg-night p-4 text-white lg:flex">
      <div>
        <p className="text-sm text-white/70">{count ? `${count} ta xizmat tanlandi` : "Xizmatni tanlang"}</p>
        <p className="text-xl font-bold">{count ? money(total) : "—"}</p>
      </div>
      <Button onClick={onOrder} icon={<ShoppingBag className="h-4 w-4" />}>
        Buyurtma berish
      </Button>
    </div>
  );
}
