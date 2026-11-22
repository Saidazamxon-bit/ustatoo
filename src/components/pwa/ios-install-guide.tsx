"use client";

import { useEffect, useState } from "react";
import { Share, SquarePlus, Check, Compass } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo";
import { usePwa } from "./pwa-provider";
import { cn } from "@/lib/utils";

const STEPS = [
  { icon: Share, title: "“Ulashish” tugmasini bosing", text: "Safari pastki panelidagi kvadrat va yuqoriga strelka belgisi." },
  { icon: SquarePlus, title: "“Bosh ekranga qo‘shish”", text: "Ro‘yxatni pastga suring va “Add to Home Screen” bandini tanlang." },
  { icon: Check, title: "“Qo‘shish” ni bosing", text: "O‘ng yuqoridagi “Add” — UstaTop bosh ekraningizda paydo bo‘ladi." },
];

/** iPhone/iPad uchun "Bosh ekranga qo‘shish" animatsion yo‘riqnomasi */
export function IosInstallGuide() {
  const { iosGuideOpen, setIosGuideOpen, iosBrowser } = usePwa();
  const [step, setStep] = useState(0);
  const [isIpad, setIsIpad] = useState(false);

  useEffect(() => {
    setIsIpad(/iPad/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
  }, []);

  useEffect(() => {
    if (!iosGuideOpen) return;
    setStep(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2600);
    return () => clearInterval(id);
  }, [iosGuideOpen]);

  return (
    <Modal
      open={iosGuideOpen}
      onClose={() => setIosGuideOpen(false)}
      title="Bosh ekranga qo‘shish"
      footer={
        <Button className="w-full" size="lg" onClick={() => setIosGuideOpen(false)}>
          Tushunarli
        </Button>
      }
    >
      {iosBrowser === "other" && (
        <div className="mb-4 flex gap-3 rounded-2xl bg-amber-50 p-3.5 text-sm text-amber-900">
          <Compass className="h-5 w-5 shrink-0" />
          <span>
            Eng yaxshi natija uchun sahifani <b>Safari</b> brauzerida oching. Boshqa brauzerlarda “Ulashish” tugmasi manzil satrida joylashgan.
          </span>
        </div>
      )}

      {/* Animatsion telefon: qaysi tugmani bosish kerakligini ko‘rsatadi */}
      <div className="relative mx-auto mb-5 h-[260px] w-[200px] select-none" aria-hidden>
        <div className="absolute inset-0 rounded-[2.2rem] border-[6px] border-night bg-cream shadow-[var(--shadow-lift)]">
          <div className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full bg-night" />
          {/* Sahifa kontenti */}
          <div className="absolute inset-x-3 top-9 space-y-2">
            <div className="flex items-center gap-1.5">
              <LogoMark size={18} />
              <span className="text-[10px] font-extrabold">
                Usta<span className="text-brand-500">Top</span>
              </span>
            </div>
            <div className="h-3 w-3/4 rounded bg-ink/80" />
            <div className="h-3 w-1/2 rounded bg-brand-400" />
            <div className="grid grid-cols-3 gap-1 pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-md bg-brand-100" />
              ))}
            </div>
          </div>

          {/* Safari paneli */}
          <div className={cn("absolute inset-x-0 flex items-center justify-around bg-surface/95 px-3 py-2", isIpad ? "top-6 rounded-none" : "bottom-0 rounded-b-[1.7rem]")}>
            <span className="h-1.5 w-4 rounded bg-line" />
            <span className="h-1.5 w-4 rounded bg-line" />
            <span className={cn("relative flex h-7 w-7 items-center justify-center rounded-lg transition-colors", step === 0 ? "bg-brand-500 text-white" : "text-info")}>
              <Share className="h-4 w-4" />
              {step === 0 && <span className="absolute inset-0 animate-ping rounded-lg bg-brand-400/50" />}
            </span>
            <span className="h-1.5 w-4 rounded bg-line" />
            <span className="h-1.5 w-4 rounded bg-line" />
          </div>

          {/* Ulashish menyusi */}
          <div
            className={cn(
              "absolute inset-x-2 rounded-2xl bg-surface p-2 shadow-[var(--shadow-lift)] transition-all duration-500",
              step >= 1 ? "bottom-2 opacity-100" : "-bottom-24 opacity-0",
            )}
          >
            <div className="mb-1.5 h-1.5 w-1/2 rounded bg-line" />
            <div className={cn("flex items-center justify-between rounded-lg px-2 py-1.5 text-[10px] font-bold transition-colors", step === 1 ? "bg-brand-50 text-brand-700 ring-2 ring-brand-400" : "text-ink")}>
              Bosh ekranga qo‘shish <SquarePlus className="h-3.5 w-3.5" />
            </div>
            <div className="mt-1 h-1.5 w-2/3 rounded bg-line" />
          </div>

          {/* "Add" tasdiqlash */}
          <div
            className={cn(
              "absolute inset-x-2 top-8 flex items-center justify-between rounded-xl bg-surface px-2.5 py-2 text-[10px] font-semibold shadow-[var(--shadow-lift)] transition-all duration-500",
              step === 2 ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
            )}
          >
            <span className="text-info">Bekor</span>
            <span className="flex items-center gap-1">
              <LogoMark size={14} /> UstaTop
            </span>
            <span className="relative rounded-md bg-brand-500 px-2 py-0.5 text-white">
              Qo‘shish
              <span className="absolute inset-0 animate-ping rounded-md bg-brand-400/50" />
            </span>
          </div>
        </div>
      </div>

      <ol className="space-y-2.5">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <button
              type="button"
              onClick={() => setStep(i)}
              className={cn(
                "flex w-full items-start gap-3 rounded-2xl p-3 text-left transition",
                step === i ? "bg-surface shadow-[var(--shadow-soft)] ring-2 ring-brand-300" : "bg-surface/50",
              )}
            >
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold transition", step === i ? "bg-brand-500 text-white" : "bg-cream-2 text-ink-2")}>
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-bold">
                  {title} <Icon className="h-4 w-4 text-brand-500" />
                </span>
                <span className="block text-sm text-muted">{isIpad && i === 0 ? "iPad’da tugma Safari’ning yuqori o‘ng qismida." : text}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
