"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Download, RefreshCw, Sparkles, Wifi, WifiOff, X } from "lucide-react";
import { Button, buttonClass } from "@/components/ui/button";
import { ANDROID_APK } from "@/lib/android";
import { LogoMark } from "@/components/layout/logo";
import { useSession } from "@/components/providers/session";
import { store } from "@/lib/client-storage";
import { usePwa } from "./pwa-provider";
import { IosInstallGuide } from "./ios-install-guide";
import { cn } from "@/lib/utils";

const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000; // "Keyinroq" — 3 kun ko‘rsatilmaydi
const SHOW_DELAY_MS = 6000;
// O‘z pastki paneli bor yoki diqqat talab qiladigan sahifalarda taklif ko‘rsatilmaydi
const NO_BANNER = [/^\/xabarlar\/.+/, /^\/buyurtma\/yangi/, /^\/tolov\//, /^\/kirish/, /^\/royxatdan-otish/, /^\/admin/, /^\/ilova/];

/** Mobilda pastki navigatsiya ustida, kompyuterda o‘ng pastki burchakda */
const floating = "fixed inset-x-3 bottom-[calc(5.6rem+env(safe-area-inset-bottom))] z-[70] mx-auto max-w-md lg:inset-x-auto lg:bottom-6 lg:right-6 lg:w-[400px]";

function InstallBanner() {
  const { installAvailable, installed, promptInstall, platform, updateReady, isStandalone, isAndroidApp } = usePwa();
  const pathname = usePathname();
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  // Android’da asosiy yo‘l — saytdan APK yuklab olish (Play Market shart emas)
  const android = platform === "android" && !isStandalone && !isAndroidApp;
  const offer = android ? !installed : installAvailable && !installed;

  useEffect(() => {
    if (!offer) return setVisible(false);
    if (NO_BANNER.some((r) => r.test(pathname))) return setVisible(false);
    if (Date.now() < store.get<number>("pwa:snoozeUntil", 0)) return;
    const id = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, [offer, pathname]);

  if (!visible || updateReady) return null;
  const later = (ms = SNOOZE_MS) => {
    store.set("pwa:snoozeUntil", Date.now() + ms);
    setVisible(false);
  };
  return (
    <div role="dialog" aria-label="Ilovani o‘rnatish taklifi" className={cn(floating, "animate-slide-up")}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-surface p-4 shadow-[var(--shadow-lift)] ring-1 ring-black/[0.04]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-brand-200/60 blur-2xl" />
        <button onClick={() => later()} aria-label="Yopish" className="absolute right-3 top-3 rounded-full p-1.5 text-muted hover:bg-cream">
          <X className="h-4 w-4" />
        </button>
        <div className="relative flex gap-3.5 pr-6">
          <span className="relative h-[52px] w-[52px] shrink-0">
            <LogoMark size={52} className="drop-shadow-[0_8px_16px_rgba(244,119,33,0.35)]" />
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-cream ring-2 ring-surface">
              <Download className="h-3 w-3" />
            </span>
          </span>
          <div>
            <p className="text-[16px] font-bold leading-tight">{android ? "UstaTop Android ilovasi" : "UstaTop’ni ilova sifatida o‘rnating!"}</p>
            <p className="mt-1 text-[13px] leading-snug text-muted">
              {android
                ? `Ilovani to‘g‘ridan-to‘g‘ri saytdan yuklab oling — ${ANDROID_APK.sizeMb} MB, Play Market shart emas.`
                : "UstaTop’dan tezroq foydalaning. Ilovani bosh ekraningizga qo‘shing va barcha xizmatlardan qulay foydalaning."}
            </p>
          </div>
        </div>
        <div className="relative mt-3.5 flex gap-2">
          {android ? (
            <a
              href={ANDROID_APK.url}
              download
              className={buttonClass("primary", "md", "flex-1")}
              onClick={() => {
                later(14 * 24 * 60 * 60 * 1000);
                // Yuklab olish boshlangach, o‘rnatish yo‘riqnomasini ko‘rsatamiz
                setTimeout(() => router.push("/ilova?yuklandi=1#android"), 400);
              }}
            >
              <Download className="h-4 w-4" /> Yuklab olish
            </a>
          ) : (
            <Button
              className="flex-1"
              onClick={async () => {
                const r = await promptInstall();
                if (r !== "unavailable") setVisible(false);
              }}
              icon={<Download className="h-4 w-4" />}
            >
              Ilovani o‘rnatish
            </Button>
          )}
          <Button variant="secondary" onClick={() => later()}>
            Keyinroq
          </Button>
        </div>
        <Link href={android ? "/ilova#android" : "/ilova"} onClick={() => setVisible(false)} className="relative mt-2 block text-center text-xs font-semibold text-muted hover:text-brand-600">
          {platform === "ios" ? "iPhone’ga qanday o‘rnatiladi?" : android ? "Qanday o‘rnatiladi?" : "Ilova haqida batafsil"}
        </Link>
      </div>
    </div>
  );
}

function UpdatePrompt() {
  const { updateReady, applyUpdate, updating } = usePwa();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      setDismissed(sessionStorage.getItem("ut:update-later") === "1");
    } catch {}
  }, []);

  if (!updateReady || dismissed) return null;
  const later = () => {
    try {
      sessionStorage.setItem("ut:update-later", "1");
    } catch {}
    setDismissed(true);
  };
  return (
    <div role="alertdialog" aria-labelledby="ut-update-title" className={cn(floating, "z-[75] animate-slide-up")}>
      <div className="relative overflow-hidden rounded-[1.75rem] bg-night p-4 text-white shadow-[var(--shadow-lift)]">
        <div className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full bg-brand-500/40 blur-2xl" />
        <div className="relative flex gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 shadow-[var(--shadow-brand)]">
            <Sparkles className="h-6 w-6" />
          </span>
          <div>
            <p id="ut-update-title" className="text-[16px] font-bold">
              UstaTop yangilandi!
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-white/75">
              Ilovaning yangi versiyasi tayyor. Yangi imkoniyatlardan foydalanish uchun ilovani yangilang.
            </p>
          </div>
        </div>
        <div className="relative mt-3.5 flex gap-2">
          <Button className="flex-1" loading={updating} onClick={applyUpdate} icon={<RefreshCw className="h-4 w-4" />}>
            Hozir yangilash
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={later} disabled={updating}>
            Keyinroq
          </Button>
        </div>
        <Link href="/yangilanishlar" className="relative mt-2 block text-center text-xs font-semibold text-white/60 hover:text-white">
          Nimalar yangilandi?
        </Link>
      </div>
    </div>
  );
}

function NetworkStatus() {
  const { online } = usePwa();
  const router = useRouter();
  const { refreshCounts } = useSession();
  const [showBack, setShowBack] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setShowBack(true);
      // Internet qaytdi: sahifa ma'lumotlari va hisoblagichlarni serverdan qayta olamiz
      router.refresh();
      refreshCounts();
      const id = setTimeout(() => setShowBack(false), 2800);
      return () => clearTimeout(id);
    }
  }, [online, router, refreshCounts]);

  if (online && !showBack) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[90] flex justify-center px-4" role="status" aria-live="polite">
      <div
        className={cn(
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-[var(--shadow-lift)] animate-fade-up",
          online ? "bg-green-600 text-white" : "bg-ink text-cream",
        )}
      >
        {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4 text-brand-300" />}
        {online ? "Internet qaytdi — ma’lumotlar yangilandi" : "Internet yo‘q — oflayn rejim"}
      </div>
    </div>
  );
}

/** Global PWA interfeysi: o‘rnatish taklifi, iOS yo‘riqnomasi, yangilanish va tarmoq holati */
export function PwaUi() {
  return (
    <>
      <NetworkStatus />
      <UpdatePrompt />
      <InstallBanner />
      <IosInstallGuide />
    </>
  );
}
