"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Phone, UserRound, Wrench, BadgeCheck } from "lucide-react";
import { Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { REGION_NAMES, getDistricts } from "@/lib/regions";
import { cn } from "@/lib/utils";

export function RegisterForm({ categories, allowMaster }: { categories: { id: string; name: string }[]; allowMaster: boolean }) {
  const sp = useSearchParams();
  const [role, setRole] = useState<"CLIENT" | "MASTER">(sp.get("rol") === "usta" && allowMaster ? "MASTER" : "CLIENT");
  const [f, setF] = useState({ name: "", phone: "+998 ", password: "", region: "Toshkent shahri", district: "", categoryId: "", specialty: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value, ...(k === "region" ? { district: "" } : {}) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.post("/api/auth/register", { ...f, role });
      toast.success("Ro‘yxatdan o‘tdingiz!", role === "MASTER" ? "Endi profilingizni to‘ldiring" : "Xush kelibsiz");
      const next = sp.get("next");
      router.replace(role === "MASTER" ? "/usta/profil?yangi=1" : next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
      router.refresh();
    } catch (err) {
      const e2 = err as ApiError;
      setErrors(e2.fields ?? {});
      toast.error(e2.message);
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-bold tracking-tight">Ro‘yxatdan o‘tish</h1>
      <p className="mt-1.5 text-muted">Bir daqiqada hisob yarating</p>

      <div className="mt-6 grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="Hisob turi">
        {[
          { v: "CLIENT" as const, l: "Mijozman", d: "Usta qidiryapman", icon: UserRound },
          { v: "MASTER" as const, l: "Ustaman", d: "Buyurtma olaman", icon: Wrench },
        ].map(({ v, l, d, icon: Icon }) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={role === v}
            disabled={v === "MASTER" && !allowMaster}
            onClick={() => setRole(v)}
            className={cn(
              "rounded-[1.25rem] p-4 text-left transition disabled:opacity-40",
              role === v ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-surface shadow-[var(--shadow-soft)]",
            )}
          >
            <Icon className="mb-2 h-6 w-6" />
            <span className="block font-bold">{l}</span>
            <span className={cn("block text-xs", role === v ? "text-white/80" : "text-muted")}>{d}</span>
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Input label="Ism va familiya" autoComplete="name" icon={<UserRound className="h-4 w-4" />} value={f.name} onChange={set("name")} error={errors.name} placeholder="Aziz Karimov" />
        <Input label="Telefon raqam" type="tel" inputMode="tel" autoComplete="tel" icon={<Phone className="h-4 w-4" />} value={f.phone} onChange={set("phone")} error={errors.phone} />
        <Input label="Parol" type="password" autoComplete="new-password" icon={<Lock className="h-4 w-4" />} value={f.password} onChange={set("password")} error={errors.password} hint="Kamida 6 belgi" />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Hudud" value={f.region} onChange={set("region")} error={errors.region} options={REGION_NAMES.map((r) => ({ value: r, label: r }))} />
          <Select label="Tuman" value={f.district} onChange={set("district")} error={errors.district} placeholder="Tanlang" options={getDistricts(f.region).map((d) => ({ value: d.name, label: d.name }))} />
        </div>
        {role === "MASTER" && (
          <div className="space-y-4 rounded-[1.5rem] bg-surface p-4 shadow-[var(--shadow-soft)] animate-fade-up">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-700">
              <BadgeCheck className="h-4 w-4" /> Usta ma’lumotlari
            </p>
            <Select label="Asosiy yo‘nalish" value={f.categoryId} onChange={set("categoryId")} error={errors.categoryId} placeholder="Kategoriyani tanlang" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
            <Input label="Mutaxassislik" value={f.specialty} onChange={set("specialty")} error={errors.specialty} placeholder="Masalan: Elektrik montajchi" />
          </div>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          {role === "MASTER" ? "Usta sifatida ro‘yxatdan o‘tish" : "Ro‘yxatdan o‘tish"}
        </Button>
        <p className="text-center text-xs text-muted">
          Ro‘yxatdan o‘tib,{" "}
          <Link href="/maxfiylik" className="font-semibold underline underline-offset-2">
            maxfiylik siyosati
          </Link>
          ga rozilik bildirasiz.
        </p>
      </form>
      <p className="mt-5 text-center text-[15px] text-muted">
        Hisobingiz bormi?{" "}
        <Link href="/kirish" className="font-bold text-brand-600">
          Kirish
        </Link>
      </p>
    </div>
  );
}
