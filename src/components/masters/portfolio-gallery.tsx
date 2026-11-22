"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { SmartImage } from "@/components/ui/misc";

type Item = { id: string; image: string; title: string; description: string | null };

export function PortfolioGallery({ items }: { items: Item[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const cur = idx !== null ? items[idx] : null;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((p, i) => (
          <button key={p.id} onClick={() => setIdx(i)} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-2 text-left shadow-[var(--shadow-soft)]">
            <SmartImage src={p.image} alt={p.title} sizes="(max-width:640px) 50vw, 240px" className="transition duration-500 group-hover:scale-110" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2.5 pt-8 text-[13px] font-semibold text-white">{p.title}</span>
          </button>
        ))}
      </div>
      <Modal open={cur !== null} onClose={() => setIdx(null)} title={cur?.title} className="sm:max-w-3xl">
        {cur && (
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-night">
              <SmartImage src={cur.image} alt={cur.title} sizes="(max-width:768px) 100vw, 768px" className="object-contain" />
              {items.length > 1 && (
                <>
                  <button aria-label="Oldingi" onClick={() => setIdx((i) => ((i ?? 0) - 1 + items.length) % items.length)} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button aria-label="Keyingi" onClick={() => setIdx((i) => ((i ?? 0) + 1) % items.length)} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {cur.description && <p className="mt-3 text-[15px] text-ink-2">{cur.description}</p>}
            <p className="mt-1 text-sm text-muted">
              {(idx ?? 0) + 1} / {items.length}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
