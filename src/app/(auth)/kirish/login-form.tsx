"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Phone, Eye, EyeOff, UserRound, Wrench, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";
import { clearPrivateClientData } from "@/components/forms/logout-button";

const DEMO = [
  { label: "Mijoz", phone: "+998 90 123 45 67", password: "demo123", icon: UserRound },
  { label: "Usta", phone: "+998 91 234 56 78", password: "demo123", icon: Wrench },
  { label: "Admin", phone: "+998 99 000 00 00", password: "admin123", icon: ShieldCheck },
];

/** Tashqi saytga yo‘naltirishning oldini olish: faqat ichki yo‘llar */
export function safeNext(next: string | null, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function LoginForm() {
  const [phone, setPhone] = useState("+998 ");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const toast = useToast();

  const login = async (p = phone, pw = password) => {
    setBusy(true);
    setErrors({});
    try {
      const res = await api.post<{ role: string }>("/api/auth/login", { phone: p, password: pw });
      clearPrivateClientData();
      toast.success("Xush kelibsiz!");
      const fallback = res.role === "ADMIN" ? "/admin" : res.role === "MASTER" ? "/usta/panel" : "/";
      router.replace(safeNext(sp.get("next"), fallback));
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      setErrors(err.fields ?? { password: err.message });
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <h1 className="text-3xl font-bold tracking-tight">Tizimga kirish</h1>
      <p className="mt-1.5 text-muted">Telefon raqamingiz va parolingizni kiriting</p>
      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <Input label="Telefon raqam" type="tel" inputMode="tel" autoComplete="tel" icon={<Phone className="h-4 w-4" />} value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} placeholder="+998 90 123 45 67" />
        <div className="relative">
          <Input label="Parol" type={show ? "text" : "password"} autoComplete="current-password" icon={<Lock className="h-4 w-4" />} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} placeholder="••••••" />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"} className="absolute right-3 top-[38px] p-1.5 text-muted">
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy}>
          Kirish
        </Button>
      </form>
      <p className="mt-5 text-center text-[15px] text-muted">
        Hisobingiz yo‘qmi?{" "}
        <Link href={`/royxatdan-otish${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`} className="font-bold text-brand-600">
          Ro‘yxatdan o‘ting
        </Link>
      </p>

      <div className="mt-8 rounded-[1.5rem] bg-surface p-4 shadow-[var(--shadow-soft)]">
        <p className="mb-3 text-sm font-semibold text-ink-2">Demo hisoblar bilan sinab ko‘ring:</p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO.map(({ label, phone: p, password: pw, icon: Icon }) => (
            <button
              key={label}
              type="button"
              disabled={busy}
              onClick={() => {
                setPhone(p);
                setPassword(pw);
                login(p, pw);
              }}
              className="flex flex-col items-center gap-1.5 rounded-2xl bg-cream p-3 text-sm font-bold transition hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
            >
              <Icon className="h-5 w-5 text-brand-500" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
