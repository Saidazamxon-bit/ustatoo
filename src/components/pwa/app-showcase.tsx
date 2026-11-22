"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { BadgeCheck, Bell, Check, Download, MoreVertical, Share, SquarePlus, Smartphone, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePwa } from "./pwa-provider";

/** Element ekranga kirganda yumshoq paydo bo‘ladi (prefers-reduced-motion hurmat qilinadi) */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) return setVisible(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", visible && "is-visible", className)} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

const SCREENS = [
  { src: "/img/app/screen-home.png", alt: "UstaTop bosh sahifasi" },
  { src: "/img/app/screen-master.png", alt: "Usta profili" },
  { src: "/img/app/screen-payment.png", alt: "To‘lov sahifasi" },
];

/** Haqiqiy ilova skrinshotlari almashib turadigan telefon mockup */
export function PhoneMockup({ className }: { className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((x) => (x + 1) % SCREENS.length), 3800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={cn("relative mx-auto w-[260px] sm:w-[290px]", className)}>
      {/* Orqa yorug‘lik */}
      <div className="absolute -inset-10 -z-10 rounded-full bg-gradient-to-br from-brand-300/70 via-brand-200/40 to-amber-200/50 blur-3xl animate-glow" aria-hidden />
      <div className="animate-float">
        <div className="relative rounded-[3rem] bg-ink p-[10px] shadow-[0_40px_80px_-30px_rgba(84,52,24,0.55)] ring-1 ring-black/10">
          <div className="relative aspect-[390/844] overflow-hidden rounded-[2.4rem] bg-cream">
            {SCREENS.map((s, idx) => (
              <Image
                key={s.src}
                src={s.src}
                alt={s.alt}
                fill
                sizes="290px"
                priority={idx === 0}
                className={cn("object-cover object-top transition-opacity duration-700", idx === i ? "opacity-100" : "opacity-0")}
              />
            ))}
            <div className="absolute left-1/2 top-2.5 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-ink" />
          </div>
          <span className="absolute -left-[3px] top-28 h-12 w-[3px] rounded-l bg-ink" aria-hidden />
          <span className="absolute -right-[3px] top-36 h-16 w-[3px] rounded-r bg-ink" aria-hidden />
        </div>
      </div>

      {/* Suzuvchi kartalar */}
      <div className="absolute -left-10 top-24 hidden w-52 rounded-2xl bg-white/95 p-3 shadow-[var(--shadow-lift)] backdrop-blur sm:block animate-float [animation-delay:-2s]">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-500">
            <Bell className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold">Buyurtma qabul qilindi</p>
            <p className="truncate text-[11px] text-muted">Usta 14:00 da keladi</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-8 bottom-28 hidden rounded-2xl bg-white/95 px-3 py-2.5 shadow-[var(--shadow-lift)] backdrop-blur sm:block animate-float [animation-delay:-4s]">
        <p className="flex items-center gap-1 text-sm font-bold">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9
          <BadgeCheck className="ml-1 h-4 w-4 fill-brand-500 text-white" />
        </p>
        <p className="text-[11px] text-muted">Tasdiqlangan ustalar</p>
      </div>

      <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
        {SCREENS.map((s, idx) => (
          <span key={s.src} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-6 bg-brand-500" : "w-1.5 bg-line")} />
        ))}
      </div>
    </div>
  );
}

const GUIDES = {
  android: [
    { icon: Download, title: "“Ilovani o‘rnatish” ni bosing", text: "Chrome o‘rnatish oynasini ochadi." },
    { icon: Check, title: "“O‘rnatish” ni tasdiqlang", text: "Ilova bir necha soniyada qo‘shiladi." },
    { icon: Smartphone, title: "Bosh ekrandan oching", text: "UstaTop alohida ilova kabi ochiladi." },
  ],
  ios: [
    { icon: Share, title: "Safari’da “Ulashish” ni bosing", text: "Pastki paneldagi kvadrat va strelka." },
    { icon: SquarePlus, title: "“Bosh ekranga qo‘shish”", text: "Menyuni pastga suring va tanlang." },
    { icon: Check, title: "“Qo‘shish” ni bosing", text: "UstaTop bosh ekraningizda paydo bo‘ladi." },
  ],
};

/** O‘rnatish jarayonining animatsion ko‘rsatmasi (Android / iPhone) */
export function InstallSteps() {
  const { platform } = usePwa();
  const [tab, setTab] = useState<"android" | "ios">("android");
  const [active, setActive] = useState(0);
  useEffect(() => setTab(platform === "ios" ? "ios" : "android"), [platform]);
  useEffect(() => {
    setActive(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 2400);
    return () => clearInterval(id);
  }, [tab]);

  return (
    <div>
      <div className="mx-auto mb-6 grid max-w-xs grid-cols-2 gap-1 rounded-full bg-white p-1 shadow-[var(--shadow-soft)]" role="tablist">
        {(["android", "ios"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("rounded-full py-2.5 text-sm font-bold transition", tab === t ? "bg-ink text-white" : "text-ink-2")}
          >
            {t === "android" ? "Android" : "iPhone / iPad"}
          </button>
        ))}
      </div>
      <ol className="grid gap-3 md:grid-cols-3">
        {GUIDES[tab].map(({ icon: Icon, title, text }, idx) => (
          <li
            key={title}
            className={cn(
              "relative overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-500",
              active === idx ? "-translate-y-1 ring-2 ring-brand-400 shadow-[var(--shadow-lift)]" : "opacity-80",
            )}
          >
            <span className="absolute right-4 top-3 text-5xl font-extrabold text-cream-2">{idx + 1}</span>
            <span className={cn("relative mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500", active === idx ? "bg-brand-500 text-white shadow-[var(--shadow-brand)]" : "bg-brand-50 text-brand-500")}>
              <Icon className="h-6 w-6" />
              {active === idx && <span className="absolute inset-0 animate-ping rounded-2xl bg-brand-400/40" />}
            </span>
            <p className="relative font-bold">{title}</p>
            <p className="relative mt-1 text-sm text-muted">{text}</p>
            <div className="relative mt-4 h-1 overflow-hidden rounded-full bg-cream-2">
              <div className={cn("h-full rounded-full bg-brand-500 transition-all ease-linear", active === idx ? "w-full duration-[2400ms]" : active > idx ? "w-full duration-0" : "w-0 duration-0")} />
            </div>
          </li>
        ))}
      </ol>
      {tab === "android" && (
        <p className="mt-4 text-center text-sm text-muted">
          Tugma chiqmasa: Chrome <MoreVertical className="inline h-4 w-4 align-[-3px]" /> menyusi → “Ilovani o‘rnatish”.
        </p>
      )}
    </div>
  );
}
