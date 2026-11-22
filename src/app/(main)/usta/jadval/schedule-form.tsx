"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { WorkDaysPicker } from "../profil/master-profile-form";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

export function ScheduleForm({ initial }: { initial: { workDays: number[]; workStart: string; workEnd: string } }) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setErrors({});
        try {
          await api.patch("/api/master/schedule", f);
          toast.success("Ish jadvali saqlandi");
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
      <p className="font-bold">Ish kunlari va soatlari</p>
      <WorkDaysPicker value={f.workDays} onChange={(workDays) => setF({ ...f, workDays })} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Boshlanishi" type="time" value={f.workStart} onChange={(e) => setF({ ...f, workStart: e.target.value })} error={errors.workStart} />
        <Input label="Tugashi" type="time" value={f.workEnd} onChange={(e) => setF({ ...f, workEnd: e.target.value })} error={errors.workEnd} />
      </div>
      <p className="text-sm text-muted">Mijozlar buyurtma berishda faqat shu kun va soatlarni tanlay oladi.</p>
      <Button type="submit" loading={busy}>Saqlash</Button>
    </form>
  );
}
