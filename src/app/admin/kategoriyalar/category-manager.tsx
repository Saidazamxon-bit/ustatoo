"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Textarea, Toggle } from "@/components/ui/form";
import { SmartImage, Badge } from "@/components/ui/misc";
import { ImageUploader } from "@/components/forms/image-uploader";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { slugify } from "@/lib/text";

type C = { id: string; name: string; slug: string; description: string; image: string; icon: string; sortOrder: number; isActive: boolean; masters: number; services: number };
const EMPTY = { name: "", slug: "", description: "", image: "", icon: "wrench", sortOrder: 99, isActive: true };

export function CategoryManager({ initial }: { initial: C[] }) {
  const [editing, setEditing] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    setErrors({});
    try {
      const { id, ...body } = editing;
      if (id) await api.patch(`/api/admin/categories/${id}`, body);
      else await api.post("/api/admin/categories", body);
      toast.success("Kategoriya saqlandi");
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

  const remove = async (c: C) => {
    if (!window.confirm(`“${c.name}” kategoriyasini o‘chirasizmi?`)) return;
    try {
      await api.delete(`/api/admin/categories/${c.id}`);
      toast.success("O‘chirildi");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggle = async (c: C) => {
    try {
      await api.patch(`/api/admin/categories/${c.id}`, { isActive: !c.isActive });
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[28px] font-bold tracking-tight">Kategoriyalar</h1>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => { setErrors({}); setEditing({ ...EMPTY }); }}>
          Yangi kategoriya
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {initial.map((c) => (
          <div key={c.id} className="card flex gap-3 p-3">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
              <SmartImage src={c.image} alt={c.name} sizes="96px" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate font-bold">{c.name}</p>
                {!c.isActive && <Badge>Yashirin</Badge>}
              </div>
              <p className="text-xs text-muted">/{c.slug} · tartib {c.sortOrder}</p>
              <p className="text-xs text-muted">{c.masters} usta · {c.services} xizmat</p>
              <div className="mt-2 flex gap-1.5">
                <button onClick={() => { setErrors({}); setEditing({ ...c }); }} className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-bold"><Pencil className="h-3 w-3" /> Tahrir</button>
                <button onClick={() => toggle(c)} className="rounded-full bg-cream px-2.5 py-1 text-xs font-bold">{c.isActive ? "Yashirish" : "Ko‘rsatish"}</button>
                <button onClick={() => remove(c)} aria-label="O‘chirish" className="ml-auto rounded-full p-1.5 text-muted hover:text-danger"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Kategoriyani tahrirlash" : "Yangi kategoriya"} footer={<Button className="w-full" size="lg" loading={busy} onClick={save}>Saqlash</Button>}>
        {editing && (
          <div className="space-y-4">
            <Input label="Nomi" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} error={errors.name} />
            <Input label="Slug (URL)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} error={errors.slug} />
            <Textarea label="Tavsif" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} maxLength={300} />
            <Input label="Tartib raqami" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
            <div>
              <p className="mb-2 text-sm font-semibold text-ink-2">Rasm</p>
              <ImageUploader value={editing.image ? [editing.image] : []} onChange={(v) => setEditing({ ...editing, image: v[0] ?? "" })} max={1} tileClassName="h-28 w-36" />
              {errors.image && <p className="mt-1 text-sm text-danger">{errors.image}</p>}
            </div>
            <Toggle label="Faol" checked={editing.isActive} onChange={(v) => setEditing({ ...editing, isActive: v })} />
          </div>
        )}
      </Modal>
    </div>
  );
}
