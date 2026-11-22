"use client";

import { useState } from "react";
import { Download, CheckCircle2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/providers/toast";
import { usePwa } from "./pwa-provider";
import { cn } from "@/lib/utils";

/**
 * Qurilmaga mos "Ilovani o‘rnatish" tugmasi:
 * Android/Chromium — native oyna, iOS — animatsion yo‘riqnoma, boshqalar — qo‘lda o‘rnatish ko‘rsatmasi.
 */
export function InstallButton({
  className,
  size = "lg",
  label = "Ilovani o‘rnatish",
  variant = "primary",
}: {
  className?: string;
  size?: "md" | "lg";
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const { isStandalone, promptInstall, canPromptInstall, platform } = usePwa();
  const [manualOpen, setManualOpen] = useState(false);
  const toast = useToast();

  if (isStandalone) {
    return (
      <span className={cn("inline-flex h-14 items-center justify-center gap-2 rounded-full bg-green-50 px-7 font-semibold text-green-700", className)}>
        <CheckCircle2 className="h-5 w-5" /> Ilova o‘rnatilgan
      </span>
    );
  }

  const onClick = async () => {
    if (canPromptInstall || platform === "ios") {
      const result = await promptInstall();
      if (result === "accepted" && platform !== "ios") toast.success("UstaTop o‘rnatilmoqda", "Ilova bosh ekraningizda paydo bo‘ladi");
      return;
    }
    setManualOpen(true);
  };

  return (
    <>
      <Button size={size} variant={variant} className={cn("group", className)} onClick={onClick} icon={<Download className="h-5 w-5 transition group-hover:translate-y-0.5" />}>
        {label}
      </Button>
      <Modal open={manualOpen} onClose={() => setManualOpen(false)} title="Ilovani o‘rnatish" footer={<Button className="w-full" onClick={() => setManualOpen(false)}>Tushunarli</Button>}>
        <div className="space-y-3 text-[15px] text-ink-2">
          <p className="flex gap-2">
            <MonitorSmartphone className="h-5 w-5 shrink-0 text-brand-500" />
            Brauzeringiz avtomatik o‘rnatish oynasini taqdim etmadi. Quyidagi usul bilan o‘rnating:
          </p>
          <ul className="space-y-2 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
            <li><b>Android (Chrome):</b> ⋮ menyu → “Ilovani o‘rnatish” yoki “Bosh ekranga qo‘shish”.</li>
            <li><b>Samsung Internet:</b> ☰ menyu → “Sahifani qo‘shish” → “Bosh ekran”.</li>
            <li><b>Kompyuter (Chrome / Edge):</b> manzil satridagi o‘rnatish belgisi (⊕) ni bosing.</li>
            <li><b>Mac (Safari 17+):</b> Fayl → “Dock’ga qo‘shish”.</li>
          </ul>
          <p className="text-sm text-muted">Agar ilova allaqachon o‘rnatilgan bo‘lsa, uni bosh ekran yoki ilovalar ro‘yxatidan oching.</p>
        </div>
      </Modal>
    </>
  );
}
