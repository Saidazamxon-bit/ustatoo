"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { SmartImage, Badge } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { ImageUploader } from "@/components/forms/image-uploader";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { PRICE_UNITS, PRICE_UNIT_LABELS } from "@/lib/constants";
import { priceWithUnit } from "@/lib/format";
import { cn } from "@/lib/utils";

type S = { id: string; title: string; description: string; image: string | null; price: number; priceUnit: string; durationText: string; isActive: boolean; orders: number };
const EMPTY = { title: "", description: "", image: null as string | null, price: 0, priceUnit: "FIXED", durationText: "1-2 soat", isActive: true };

export function ServicesManager({ initial, fallbackImage }: { initial: S[]; fallbackImage: string }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [confirmDel, setConfirmDel] = useState<S | null>(null);
  const router = useRouter();
  const toast = useToast();

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setErrors({});
    try {
      const { id, ...body } = editing;
      if (id) {
        const s = await api.patch<S>(`/api/master/services/${id}`, body);
        setItems((p) => p.map((x) => (x.id === id ? { ...x, ...s } : x)));
        toast.success("Xizmat yangilandi");
      } else {
        const s = await api.post<S>("/api/master/services", body);
        setItems((p) => [{ ...s, orders: 0 }, ...p]);
        toast.success("Xizmat qo‘shildi");
      }
      setEditing(null);
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (s: S) => {
    setItems((p) => p.map((x) => (x.id === s.id ? { ...x, isActive: !s.isActive } : x)));
    try {
      await api.patch(`/api/master/services/${s.id}`, { isActive: !s.isActive });
    } catch (e) {
      setItems((p) => p.map((x) => (x.id === s.id ? { ...x, isActive: s.isActive } : x)));
      toast.error((e as Error).message);
    }
  };

  const remove = async (s: S) => {
    try {
      await api.delete(`/api/master/services/${s.id}`);
      setItems((p) => p.filter((x) => x.id !== s.id));
      toast.success("Xizmat o‘chirildi");
      setConfirmDel(null);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Xizmatlar</h1>
          <p className="text-sm text-muted">{items.length} ta xizmat · {items.filter((s) => s.isActive).length} ta faol</p>
        </div>
        <Button onClick={() => { setErrors({}); setEditing({ ...EMPTY }); }} icon={<Plus className="h-4 w-4" />}>
          Yangi xizmat
        </Button>
      </div>

      {items.length ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} className={cn("card flex gap-3.5 p-3 animate-fade-up", !s.isActive && "opacity-60")}>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl">
                <SmartImage src={s.image ?? fallbackImage} alt={s.title} sizes="96px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-bold leading-tight">{s.title}</p>
                  {!s.isActive && <Badge>Yashirin</Badge>}
                </div>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{s.description}</p>
                <p className="mt-1 font-extrabold text-brand-600">{priceWithUnit(s.price, s.priceUnit)}</p>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3.5 w-3.5" /> {s.durationText} · {s.orders} ta buyurtma
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => { setErrors({}); setEditing({ ...s }); }} className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1.5 text-xs font-bold hover:bg-brand-50">
                    <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                  </button>
                  <button onClick={() => toggle(s)} className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold hover:bg-brand-50">
                    {s.isActive ? "Yashirish" : "Faollashtirish"}
                  </button>
                  <button onClick={() => setConfirmDel(s)} aria-label="O‘chirish" className="ml-auto rounded-full p-2 text-muted hover:bg-red-50 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Wrench className="h-7 w-7" />} title="Hali xizmat qo‘shilmagan" description="Xizmatlaringiz va narxlarini qo‘shing — mijozlar ularni tanlab buyurtma beradi." action={<Button onClick={() => setEditing({ ...EMPTY })}>Birinchi xizmatni qo‘shish</Button>} />
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Xizmatni tahrirlash" : "Yangi xizmat"}
        footer={
          <Button className="w-full" size="lg" loading={busy} onClick={save}>
            Saqlash
          </Button>
        }
      >
        {editing && (
          <div className="space-y-4">
            <Input label="Xizmat nomi" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} error={errors.title} placeholder="Masalan: Rozetka o‘rnatish" />
            <Textarea label="Tavsif" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} error={errors.description} rows={3} maxLength={1000} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Narx (so‘m)" inputMode="numeric" value={editing.price || ""} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value.replace(/\D/g, "")) })} error={errors.price} />
              <Select label="Birlik" value={editing.priceUnit} onChange={(e) => setEditing({ ...editing, priceUnit: e.target.value })} options={PRICE_UNITS.map((u) => ({ value: u, label: u === "FIXED" ? "Xizmat uchun" : `1 ${PRICE_UNIT_LABELS[u]}` }))} />
            </div>
            <Input label="Taxminiy bajarilish vaqti" value={editing.durationText} onChange={(e) => setEditing({ ...editing, durationText: e.target.value })} error={errors.durationText} placeholder="1-2 soat" />
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-2">Rasm</p>
              <ImageUploader value={editing.image ? [editing.image] : []} onChange={(v) => setEditing({ ...editing, image: v[0] ?? null })} max={1} />
            </div>
            <Toggle label="Faol" description="Profilingizda ko‘rinadi" checked={editing.isActive} onChange={(v) => setEditing({ ...editing, isActive: v })} />
          </div>
        )}
      </Modal>

      <Modal
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        title="Xizmatni o‘chirish"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setConfirmDel(null)}>Bekor qilish</Button>
            <Button variant="danger" className="flex-1" onClick={() => confirmDel && remove(confirmDel)}>O‘chirish</Button>
          </div>
        }
      >
        <p className="text-ink-2">“{confirmDel?.title}” xizmatini o‘chirmoqchimisiz? Avvalgi buyurtmalar saqlanib qoladi.</p>
      </Modal>
    </>
  );
}
