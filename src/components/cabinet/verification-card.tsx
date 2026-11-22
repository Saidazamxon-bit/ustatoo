"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers/toast";

export function VerificationCard({ status, note }: { status: string; note?: string | null }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  if (status === "APPROVED")
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] bg-green-50 p-4 text-green-800">
        <BadgeCheck className="h-6 w-6 shrink-0" />
        <p className="text-[15px] font-semibold">Profilingiz tasdiqlangan — mijozlar “Tasdiqlangan usta” belgisini ko‘radi.</p>
      </div>
    );
  if (status === "PENDING")
    return (
      <div className="flex items-center gap-3 rounded-[1.5rem] bg-amber-50 p-4 text-amber-800">
        <Clock className="h-6 w-6 shrink-0" />
        <p className="text-[15px] font-semibold">Arizangiz administrator tomonidan ko‘rib chiqilmoqda.</p>
      </div>
    );
  return (
    <div className="rounded-[1.5rem] bg-ink p-5 text-white">
      <div className="flex items-start gap-3">
        <ShieldAlert className="h-6 w-6 shrink-0 text-brand-400" />
        <div className="flex-1">
          <p className="font-bold">{status === "REJECTED" ? "Ariza rad etildi" : "Profilingizni tasdiqlating"}</p>
          <p className="mt-1 text-sm text-white/75">
            {status === "REJECTED" && note ? `Sabab: ${note}. ` : ""}Tasdiqlangan ustalar qidiruvda yuqoriroq chiqadi va mijozlar ishonchini qozonadi.
          </p>
        </div>
      </div>
      <Button
        className="mt-4 w-full sm:w-auto"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api.post("/api/master/verification");
            toast.success("Ariza yuborildi", "Odatda 24 soat ichida ko‘rib chiqiladi");
            router.refresh();
          } catch (e) {
            toast.error((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        Tasdiqlash uchun ariza yuborish
      </Button>
    </div>
  );
}
