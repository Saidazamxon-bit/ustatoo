"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Select, Toggle } from "@/components/ui/form";
import { REGION_NAMES, getDistricts } from "@/lib/regions";
import { cn } from "@/lib/utils";
import { money } from "@/lib/format";

type Cat = { slug: string; name: string };

const RATINGS = [
  { v: "", l: "Barchasi" },
  { v: "3", l: "3+" },
  { v: "4", l: "4+" },
  { v: "4.5", l: "4.5+" },
];
const EXPERIENCE = [
  { v: "", l: "Farqi yo‘q" },
  { v: "1", l: "1+ yil" },
  { v: "3", l: "3+ yil" },
  { v: "5", l: "5+ yil" },
  { v: "10", l: "10+ yil" },
];
const KEYS = ["kategoriya", "hudud", "tuman", "narxMin", "narxMax", "reyting", "tajriba", "hozir", "tasdiqlangan"] as const;

export function useFilterState() {
  const sp = useSearchParams();
  return useMemo(() => Object.fromEntries(KEYS.map((k) => [k, sp.get(k) ?? ""])) as Record<(typeof KEYS)[number], string>, [sp]);
}

export function FilterSheet({ categories, open, onClose }: { categories: Cat[]; open: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const initial = useFilterState();
  const [f, setF] = useState(initial);
  useEffect(() => setF(initial), [initial, open]);
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v, ...(k === "hudud" ? { tuman: "" } : {}) }));

  const apply = (values: typeof f) => {
    const next = new URLSearchParams(sp.toString());
    for (const k of KEYS) values[k] ? next.set(k, values[k]) : next.delete(k);
    next.delete("sahifa");
    next.delete("filtr");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filtrlar"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => apply(Object.fromEntries(KEYS.map((k) => [k, ""])) as typeof f)}>
            Tozalash
          </Button>
          <Button className="flex-[2]" onClick={() => apply(f)}>
            Natijalarni ko‘rsatish
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Select label="Kategoriya" value={f.kategoriya} onChange={(e) => set("kategoriya", e.target.value)} placeholder="Barcha kategoriyalar" options={categories.map((c) => ({ value: c.slug, label: c.name }))} />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Hudud" value={f.hudud} onChange={(e) => set("hudud", e.target.value)} placeholder="Barchasi" options={REGION_NAMES.map((r) => ({ value: r, label: r }))} />
          <Select
            label="Tuman"
            value={f.tuman}
            disabled={!f.hudud}
            onChange={(e) => set("tuman", e.target.value)}
            placeholder="Barchasi"
            options={getDistricts(f.hudud).map((d) => ({ value: d.name, label: d.name }))}
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-semibold text-ink-2">Narx oralig‘i (so‘m)</p>
          <div className="grid grid-cols-2 gap-3">
            <Input inputMode="numeric" placeholder="dan" value={f.narxMin} onChange={(e) => set("narxMin", e.target.value.replace(/\D/g, ""))} aria-label="Minimal narx" />
            <Input inputMode="numeric" placeholder="gacha" value={f.narxMax} onChange={(e) => set("narxMax", e.target.value.replace(/\D/g, ""))} aria-label="Maksimal narx" />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {[50000, 100000, 300000, 1000000].map((v) => (
              <button key={v} type="button" onClick={() => set("narxMax", String(v))} className={cn("rounded-full border px-3 py-1 text-xs font-semibold", f.narxMax === String(v) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-surface text-ink-2")}>
                {money(v)} gacha
              </button>
            ))}
          </div>
        </div>
        <ChipGroup label="Reyting" items={RATINGS} value={f.reyting} onChange={(v) => set("reyting", v)} />
        <ChipGroup label="Ish tajribasi" items={EXPERIENCE} value={f.tajriba} onChange={(v) => set("tajriba", v)} />
        <div className="card space-y-4 p-4">
          <Toggle label="Hozir ishlayotgan ustalar" description="Hozir buyurtma qabul qilmoqda" checked={f.hozir === "1"} onChange={(v) => set("hozir", v ? "1" : "")} />
          <Toggle label="Faqat tasdiqlangan ustalar" description="Hujjatlari tekshirilgan" checked={f.tasdiqlangan === "1"} onChange={(v) => set("tasdiqlangan", v ? "1" : "")} />
        </div>
      </div>
    </Modal>
  );
}

function ChipGroup({ label, items, value, onChange }: { label: string; items: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-ink-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <button
            key={i.v}
            type="button"
            onClick={() => onChange(i.v)}
            aria-pressed={value === i.v}
            className={cn("rounded-full px-4 py-2 text-sm font-semibold transition", value === i.v ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-surface text-ink-2 shadow-[var(--shadow-soft)]")}
          >
            {i.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Faol filtrlar "chip"lari — bittasini olib tashlash mumkin */
export function ActiveFilters({ categories }: { categories: Cat[] }) {
  const f = useFilterState();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const labels: { key: string; label: string }[] = [];
  if (f.kategoriya) labels.push({ key: "kategoriya", label: categories.find((c) => c.slug === f.kategoriya)?.name ?? f.kategoriya });
  if (f.hudud) labels.push({ key: "hudud", label: f.hudud });
  if (f.tuman) labels.push({ key: "tuman", label: f.tuman });
  if (f.narxMin) labels.push({ key: "narxMin", label: `${money(+f.narxMin)} dan` });
  if (f.narxMax) labels.push({ key: "narxMax", label: `${money(+f.narxMax)} gacha` });
  if (f.reyting) labels.push({ key: "reyting", label: `★ ${f.reyting}+` });
  if (f.tajriba) labels.push({ key: "tajriba", label: `${f.tajriba}+ yil tajriba` });
  if (f.hozir) labels.push({ key: "hozir", label: "Hozir ishlayapti" });
  if (f.tasdiqlangan) labels.push({ key: "tasdiqlangan", label: "Tasdiqlangan" });
  if (!labels.length) return null;
  const remove = (key: string) => {
    const next = new URLSearchParams(sp.toString());
    next.delete(key);
    if (key === "hudud") next.delete("tuman");
    next.delete("sahifa");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {labels.map((l) => (
        <button key={l.key} onClick={() => remove(l.key)} className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700 transition hover:bg-brand-200">
          {l.label} <X className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
