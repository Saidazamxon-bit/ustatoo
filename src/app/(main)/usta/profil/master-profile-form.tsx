"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Phone, Send } from "lucide-react";
import { Input, Select, Textarea, Toggle } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { api, ApiError, uploadImage } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { REGION_NAMES, getDistricts } from "@/lib/regions";
import { WEEKDAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";

type F = {
  avatar: string | null;
  coverImage: string | null;
  categoryId: string;
  specialty: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  workStart: string;
  workEnd: string;
  workDays: number[];
  isAvailable: boolean;
  region: string;
  district: string;
  address: string;
  publicPhone: string;
  telegram: string;
};

export function WorkDaysPicker({ value, onChange }: { value: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {WEEKDAYS.map((d) => {
        const on = value.includes(d.value);
        return (
          <button
            key={d.value}
            type="button"
            aria-pressed={on}
            title={d.label}
            onClick={() => onChange(on ? value.filter((x) => x !== d.value) : [...value, d.value].sort())}
            className={cn("h-11 w-11 rounded-full text-sm font-bold transition", on ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-surface text-ink-2 shadow-[var(--shadow-soft)]")}
          >
            {d.short}
          </button>
        );
      })}
    </div>
  );
}

export function MasterProfileForm({ initial, categories, name }: { initial: F; categories: { id: string; name: string }[]; name: string }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const router = useRouter();
  const toast = useToast();
  const set = <K extends keyof F>(k: K, v: F[K]) => setF((p) => ({ ...p, [k]: v }));

  const upload = async (kind: "avatar" | "cover", file?: File) => {
    if (!file) return;
    setUploading(kind);
    try {
      const url = await uploadImage(file, kind);
      set(kind === "avatar" ? "avatar" : "coverImage", url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.patch("/api/master/profile", f);
      toast.success("Profil saqlandi");
      router.refresh();
    } catch (err) {
      const e2 = err as ApiError;
      setErrors(e2.fields ?? {});
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* Cover va avatar */}
      <section className="card overflow-hidden">
        <label className="group relative block h-44 cursor-pointer bg-gradient-to-br from-brand-200 to-brand-100 sm:h-56">
          {f.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.coverImage} alt="Cover" className="h-full w-full object-cover" />
          )}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-2 text-xs font-bold shadow">
            <ImagePlus className="h-4 w-4" /> {uploading === "cover" ? "Yuklanmoqda…" : "Cover rasm"}
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload("cover", e.target.files?.[0])} />
        </label>
        <div className="flex items-end gap-4 px-5 pb-5">
          <label className="relative -mt-10 cursor-pointer">
            <Avatar src={f.avatar} name={name} size={88} ring />
            <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              <Camera className="h-4 w-4" />
            </span>
            <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload("avatar", e.target.files?.[0])} />
          </label>
          <div className="pb-1">
            <p className="font-bold">{name}</p>
            <p className="text-sm text-muted">{uploading === "avatar" ? "Rasm yuklanmoqda…" : "Rasm ustiga bosib almashtiring"}</p>
          </div>
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <p className="font-bold">Asosiy ma’lumotlar</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Kategoriya" value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} options={categories.map((c) => ({ value: c.id, label: c.name }))} error={errors.categoryId} />
          <Input label="Mutaxassislik" value={f.specialty} onChange={(e) => set("specialty", e.target.value)} error={errors.specialty} />
          <Input label="Tajriba (yil)" type="number" min={0} max={60} value={f.experienceYears} onChange={(e) => set("experienceYears", Number(e.target.value))} error={errors.experienceYears} />
          <Input label="Soatlik narx (so‘m)" inputMode="numeric" value={f.hourlyRate || ""} onChange={(e) => set("hourlyRate", Number(e.target.value.replace(/\D/g, "")))} error={errors.hourlyRate} />
        </div>
        <Textarea label="Usta haqida" value={f.bio} onChange={(e) => set("bio", e.target.value)} rows={5} maxLength={2000} error={errors.bio} hint={`${f.bio.length}/2000 · Tajribangiz, kafolat va ish uslubingiz haqida yozing`} />
      </section>

      <section className="card space-y-4 p-5">
        <p className="font-bold">Ish vaqti</p>
        <WorkDaysPicker value={f.workDays} onChange={(v) => set("workDays", v)} />
        {errors.workDays && <p className="text-sm text-danger">{errors.workDays}</p>}
        <div className="grid grid-cols-2 gap-4">
          <Input label="Boshlanishi" type="time" value={f.workStart} onChange={(e) => set("workStart", e.target.value)} error={errors.workStart} />
          <Input label="Tugashi" type="time" value={f.workEnd} onChange={(e) => set("workEnd", e.target.value)} error={errors.workEnd} />
        </div>
        <Toggle label="Hozir ishlayapman" description="Buyurtma qabul qilish holati" checked={f.isAvailable} onChange={(v) => set("isAvailable", v)} />
      </section>

      <section className="card space-y-4 p-5">
        <p className="font-bold">Joylashuv va aloqa</p>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Hudud" value={f.region} onChange={(e) => setF((p) => ({ ...p, region: e.target.value, district: "" }))} options={REGION_NAMES.map((r) => ({ value: r, label: r }))} error={errors.region} />
          <Select label="Tuman" value={f.district} placeholder="Tanlang" onChange={(e) => set("district", e.target.value)} options={getDistricts(f.region).map((d) => ({ value: d.name, label: d.name }))} error={errors.district} />
        </div>
        <Input label="Manzil / ustaxona (ixtiyoriy)" value={f.address} onChange={(e) => set("address", e.target.value)} error={errors.address} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Mijozlar uchun telefon" icon={<Phone className="h-4 w-4" />} value={f.publicPhone} onChange={(e) => set("publicPhone", e.target.value)} error={errors.publicPhone} hint="Bo‘sh qoldirsangiz, raqam yashiriladi" />
          <Input label="Telegram username" icon={<Send className="h-4 w-4" />} value={f.telegram} onChange={(e) => set("telegram", e.target.value)} error={errors.telegram} placeholder="@username" />
        </div>
      </section>

      <div className="sticky bottom-24 z-20 lg:bottom-4">
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Saqlash
        </Button>
      </div>
    </form>
  );
}
