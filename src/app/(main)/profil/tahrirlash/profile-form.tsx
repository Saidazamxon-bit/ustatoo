"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Mail, MapPin, Phone, UserRound } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { api, ApiError, uploadImage } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { REGION_NAMES, getDistricts } from "@/lib/regions";
import { phone as fmtPhone } from "@/lib/format";

type F = { name: string; email: string; avatar: string | null; region: string; district: string; address: string };

export function ProfileForm({ initial, phone }: { initial: F; phone: string }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const onAvatar = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "avatar");
      setF((p) => ({ ...p, avatar: url }));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.patch("/api/me", f);
      toast.success("Ma’lumotlar saqlandi");
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
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col items-center gap-3 pb-2">
        <label className="relative cursor-pointer">
          <Avatar src={f.avatar} name={f.name || "?"} size={104} ring className="shadow-[var(--shadow-soft)]" />
          <span className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white shadow-[var(--shadow-brand)]">
            <Camera className="h-4 w-4" />
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => onAvatar(e.target.files?.[0])} />
        </label>
        {uploading && <p className="text-sm text-muted">Yuklanmoqda…</p>}
        {f.avatar && (
          <button type="button" className="text-sm font-semibold text-muted hover:text-danger" onClick={() => setF((p) => ({ ...p, avatar: null }))}>
            Rasmni olib tashlash
          </button>
        )}
      </div>
      <Input label="Ism va familiya" icon={<UserRound className="h-4 w-4" />} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} />
      <Input label="Telefon raqam" icon={<Phone className="h-4 w-4" />} value={fmtPhone(phone)} disabled hint="Telefon raqamni o‘zgartirish uchun qo‘llab-quvvatlash xizmatiga yozing" />
      <Input label="Email (ixtiyoriy)" type="email" icon={<Mail className="h-4 w-4" />} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Hudud" value={f.region} onChange={(e) => setF({ ...f, region: e.target.value, district: "" })} placeholder="Tanlang" options={REGION_NAMES.map((r) => ({ value: r, label: r }))} />
        <Select label="Tuman" value={f.district} onChange={(e) => setF({ ...f, district: e.target.value })} placeholder="Tanlang" options={getDistricts(f.region).map((d) => ({ value: d.name, label: d.name }))} />
      </div>
      <Input label="Manzil" icon={<MapPin className="h-4 w-4" />} value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} error={errors.address} hint="Buyurtma berishda avtomatik to‘ldiriladi" />
      <Button type="submit" size="lg" className="w-full" loading={busy}>
        Saqlash
      </Button>
    </form>
  );
}
