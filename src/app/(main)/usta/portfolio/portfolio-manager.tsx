"use client";

import { useState } from "react";
import { Images, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea } from "@/components/ui/form";
import { SmartImage } from "@/components/ui/misc";
import { EmptyState } from "@/components/ui/states";
import { ImageUploader } from "@/components/forms/image-uploader";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

type P = { id: string; image: string; title: string; description: string | null };

export function PortfolioManager({ initial }: { initial: P[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ image: "", title: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const save = async () => {
    setBusy(true);
    setErrors({});
    try {
      const p = await api.post<P>("/api/master/portfolio", form);
      setItems((x) => [p, ...x]);
      setOpen(false);
      setForm({ image: "", title: "", description: "" });
      toast.success("Ish namunasi qo‘shildi");
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? {});
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    const prev = items;
    setItems((x) => x.filter((p) => p.id !== id));
    try {
      await api.delete(`/api/master/portfolio/${id}`);
      toast.success("O‘chirildi");
    } catch (e) {
      setItems(prev);
      toast.error((e as Error).message);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted">{items.length} ta ish namunasi</p>
        </div>
        <Button onClick={() => setOpen(true)} icon={<Plus className="h-4 w-4" />}>
          Qo‘shish
        </Button>
      </div>
      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="group relative aspect-square overflow-hidden rounded-[1.4rem] bg-cream-2 shadow-[var(--shadow-soft)] animate-fade-up">
              <SmartImage src={p.image} alt={p.title} sizes="(max-width:640px) 50vw, 25vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-10 text-white">
                <p className="truncate text-sm font-bold">{p.title}</p>
              </div>
              <button onClick={() => remove(p.id)} aria-label="O‘chirish" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-danger shadow">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Images className="h-7 w-7" />} title="Portfolio bo‘sh" description="Bajargan ishlaringiz rasmlarini yuklang — bu mijozlar ishonchini oshiradi." action={<Button onClick={() => setOpen(true)}>Rasm yuklash</Button>} />
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="Yangi ish namunasi" footer={<Button className="w-full" size="lg" loading={busy} disabled={!form.image} onClick={save}>Saqlash</Button>}>
        <div className="space-y-4">
          <ImageUploader value={form.image ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] ?? "" })} max={1} label="Rasm tanlash" tileClassName="h-40 w-40" />
          {errors.image && <p className="text-sm text-danger">{errors.image}</p>}
          <Input label="Sarlavha" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} error={errors.title} placeholder="Masalan: Hammom ta’miri, Yunusobod" />
          <Textarea label="Izoh (ixtiyoriy)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} maxLength={500} />
        </div>
      </Modal>
    </>
  );
}
