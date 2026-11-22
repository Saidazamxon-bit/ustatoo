"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Toggle } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

type S = { platformName: string; commissionPercent: number; supportPhone: string; supportEmail: string; allowMasterSignup: boolean; paymentsDemo: boolean; maintenanceMessage: string };

export function PlatformSettingsForm({ initial }: { initial: S }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <form
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        try {
          await api.put("/api/admin/settings", f);
          toast.success("Sozlamalar saqlandi");
          router.refresh();
        } catch (err) {
          const e2 = err as ApiError;
          setErrors(e2.fields ?? {});
          toast.error(e2.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <section className="card space-y-4 p-5">
        <p className="font-bold">Umumiy</p>
        <Input label="Platforma nomi" value={f.platformName} onChange={(e) => setF({ ...f, platformName: e.target.value })} error={errors.platformName} />
        <Input label="Komissiya (%)" type="number" min={0} max={50} step={0.5} value={f.commissionPercent} onChange={(e) => setF({ ...f, commissionPercent: Number(e.target.value) })} error={errors.commissionPercent} hint="Ustalar daromadidan olinadigan ulush" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Qo‘llab-quvvatlash telefoni" value={f.supportPhone} onChange={(e) => setF({ ...f, supportPhone: e.target.value })} error={errors.supportPhone} />
          <Input label="Qo‘llab-quvvatlash emaili" type="email" value={f.supportEmail} onChange={(e) => setF({ ...f, supportEmail: e.target.value })} error={errors.supportEmail} />
        </div>
        <Input label="E’lon / texnik ishlar xabari" value={f.maintenanceMessage} onChange={(e) => setF({ ...f, maintenanceMessage: e.target.value })} hint="To‘ldirilsa, saytning yuqorisida banner sifatida ko‘rinadi" />
      </section>
      <section className="card space-y-5 p-5">
        <p className="font-bold">Rejimlar</p>
        <Toggle label="Yangi ustalar ro‘yxatdan o‘tishi" description="O‘chirilsa, faqat mijozlar ro‘yxatdan o‘tadi" checked={f.allowMasterSignup} onChange={(v) => setF({ ...f, allowMasterSignup: v })} />
        <Toggle label="To‘lovlar demo rejimida" description="Live rejim uchun server .env da PAYMENTS_MODE=live va provayder kalitlari kerak" checked={f.paymentsDemo} onChange={(v) => setF({ ...f, paymentsDemo: v })} />
      </section>
      <Button type="submit" size="lg" loading={busy}>Saqlash</Button>
    </form>
  );
}
