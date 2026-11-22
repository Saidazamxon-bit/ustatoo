"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Toggle, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

type Prefs = { notifyOrders: boolean; notifyMessages: boolean; notifyPromos: boolean };

export function SettingsForm({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState(initial);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const update = async (k: keyof Prefs, v: boolean) => {
    const prev = prefs;
    setPrefs({ ...prefs, [k]: v });
    try {
      await api.patch("/api/me/settings", { [k]: v });
      toast.success("Saqlandi");
    } catch (e) {
      setPrefs(prev);
      toast.error((e as Error).message);
    }
  };

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await api.post("/api/me/password", pw);
      toast.success("Parol o‘zgartirildi");
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      const e2 = err as ApiError;
      setErrors(e2.fields ?? {});
      toast.error(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="card space-y-5 p-5">
        <p className="font-bold">Bildirishnomalar</p>
        <Toggle label="Buyurtma va to‘lovlar" description="Holat o‘zgarishlari haqida xabar" checked={prefs.notifyOrders} onChange={(v) => update("notifyOrders", v)} />
        <Toggle label="Yangi xabarlar" description="Chatdagi yangi xabarlar" checked={prefs.notifyMessages} onChange={(v) => update("notifyMessages", v)} />
        <Toggle label="Aksiya va yangiliklar" description="Chegirmalar va platforma yangiliklari" checked={prefs.notifyPromos} onChange={(v) => update("notifyPromos", v)} />
      </section>
      <form onSubmit={changePw} className="card space-y-4 p-5">
        <p className="font-bold">Parolni o‘zgartirish</p>
        <Input label="Joriy parol" type="password" autoComplete="current-password" icon={<Lock className="h-4 w-4" />} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} error={errors.currentPassword} />
        <Input label="Yangi parol" type="password" autoComplete="new-password" icon={<Lock className="h-4 w-4" />} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} error={errors.newPassword} hint="Kamida 6 belgi" />
        <Button type="submit" className="w-full" loading={busy} disabled={!pw.currentPassword || !pw.newPassword}>
          Parolni yangilash
        </Button>
      </form>
    </div>
  );
}
