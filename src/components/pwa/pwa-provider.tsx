"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { runStorageMigrations, store } from "@/lib/client-storage";

/** Chrome/Edge/Samsung Internet "beforeinstallprompt" hodisasi */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export type Platform = "ios" | "android" | "desktop";
export type IosBrowser = "safari" | "other";

type PwaState = {
  platform: Platform;
  iosBrowser: IosBrowser;
  isStandalone: boolean;
  /** Native o‘rnatish oynasi mavjud (Android/desktop Chromium) */
  canPromptInstall: boolean;
  /** O‘rnatish mumkin: native prompt yoki iOS yo‘riqnomasi */
  installAvailable: boolean;
  installed: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  iosGuideOpen: boolean;
  setIosGuideOpen: (v: boolean) => void;
  /** Yangi versiya yuklab olingan va faollashishni kutmoqda */
  updateReady: boolean;
  updating: boolean;
  applyUpdate: () => void;
  checkForUpdate: () => Promise<boolean>;
  swSupported: boolean;
  online: boolean;
};

const PwaCtx = createContext<PwaState | null>(null);

export function usePwa() {
  const ctx = useContext(PwaCtx);
  if (!ctx) throw new Error("usePwa PwaProvider ichida ishlatilishi kerak");
  return ctx;
}

function detectPlatform(): { platform: Platform; iosBrowser: IosBrowser } {
  const ua = navigator.userAgent;
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(ua) || iPadOS) {
    const other = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|GSA\//i.test(ua);
    return { platform: "ios", iosBrowser: other ? "other" : "safari" };
  }
  if (/Android/i.test(ua)) return { platform: "android", iosBrowser: "safari" };
  return { platform: "desktop", iosBrowser: "safari" };
}

function detectStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

const SW_ENABLED = process.env.NODE_ENV === "production";
const UPDATE_INTERVAL_MS = 30 * 60 * 1000;

export function PwaProvider({ children }: { children: ReactNode }) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [iosBrowser, setIosBrowser] = useState<IosBrowser>("safari");
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [updating, setUpdating] = useState(false);
  const [online, setOnline] = useState(true);
  const [swSupported, setSwSupported] = useState(false);
  const regRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadingRef = useRef(false);

  // Platforma, standalone rejim va saqlangan holat
  useEffect(() => {
    runStorageMigrations();
    const p = detectPlatform();
    setPlatform(p.platform);
    setIosBrowser(p.iosBrowser);
    const standalone = detectStandalone();
    setIsStandalone(standalone);
    if (standalone) store.set("pwa:installed", true);
    setInstalled(standalone || store.get("pwa:installed", false));
    setOnline(navigator.onLine);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onMode = () => setIsStandalone(detectStandalone());
    mq.addEventListener?.("change", onMode);

    const onBip = (e: Event) => {
      e.preventDefault(); // brauzerning o‘z mini-bannerini to‘xtatib, o‘zimizning taklifni ko‘rsatamiz
      setDeferred(e as BeforeInstallPromptEvent);
      // Avval o‘rnatilgan, keyin o‘chirilgan bo‘lsa — brauzer yana taklif qiladi
      store.remove("pwa:installed");
      setInstalled(false);
    };
    const onInstalled = () => {
      store.set("pwa:installed", true);
      setInstalled(true);
      setDeferred(null);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      mq.removeEventListener?.("change", onMode);
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // Service Worker ro‘yxatdan o‘tkazish va yangilanishni kuzatish
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    setSwSupported(true);
    if (!SW_ENABLED) return;
    let interval: ReturnType<typeof setInterval>;

    const track = (reg: ServiceWorkerRegistration) => {
      // Yangi SW faqat mavjud boshqaruvchi bo‘lsa "yangilanish" hisoblanadi (birinchi o‘rnatish emas)
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        if (!sw) return;
        sw.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) setWaiting(sw);
        });
      });
    };

    const onControllerChange = () => {
      // Faqat foydalanuvchi "Hozir yangilash" ni bosganda qayta yuklaymiz
      if (!reloadingRef.current) return;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const register = () =>
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .then((reg) => {
          regRef.current = reg;
          track(reg);
          interval = setInterval(() => reg.update().catch(() => {}), UPDATE_INTERVAL_MS);
        })
        .catch((err) => console.error("[pwa] Service Worker ro‘yxatdan o‘tmadi", err));

    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    const onVisible = () => {
      if (document.visibilityState === "visible") regRef.current?.update().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null); // prompt faqat bir marta ishlatiladi
      if (choice.outcome === "accepted") {
        store.set("pwa:installed", true);
        setInstalled(true);
      }
      return choice.outcome;
    }
    if (platform === "ios") {
      setIosGuideOpen(true);
      return "accepted" as const;
    }
    return "unavailable" as const;
  }, [deferred, platform]);

  const applyUpdate = useCallback(() => {
    const sw = waiting ?? regRef.current?.waiting;
    if (!sw) {
      // SW yo‘q (masalan, eski brauzer) — oddiy qayta yuklash yangi versiyani ochadi
      window.location.reload();
      return;
    }
    setUpdating(true);
    // Qoralamalarni oxirgi marta saqlash imkonini beramiz
    window.dispatchEvent(new Event("ustatop:before-update"));
    reloadingRef.current = true;
    sw.postMessage({ type: "SKIP_WAITING" });
    // Xavfsizlik: controllerchange kelmasa ham 4 soniyadan keyin qayta yuklaymiz
    setTimeout(() => {
      if (reloadingRef.current) window.location.reload();
    }, 4000);
  }, [waiting]);

  const checkForUpdate = useCallback(async () => {
    const reg = regRef.current ?? (await navigator.serviceWorker?.getRegistration?.());
    if (!reg) return false;
    try {
      await reg.update();
    } catch {
      return false;
    }
    // installing -> installed bo‘lishini qisqa kutamiz
    for (let i = 0; i < 20; i++) {
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaiting(reg.waiting);
        return true;
      }
      if (!reg.installing) break;
      await new Promise((r) => setTimeout(r, 300));
    }
    return Boolean(reg.waiting);
  }, []);

  const value = useMemo<PwaState>(
    () => ({
      platform,
      iosBrowser,
      isStandalone,
      canPromptInstall: Boolean(deferred),
      installAvailable: !isStandalone && (Boolean(deferred) || platform === "ios"),
      installed,
      promptInstall,
      iosGuideOpen,
      setIosGuideOpen,
      updateReady: Boolean(waiting),
      updating,
      applyUpdate,
      checkForUpdate,
      swSupported,
      online,
    }),
    [platform, iosBrowser, isStandalone, deferred, installed, promptInstall, iosGuideOpen, waiting, updating, applyUpdate, checkForUpdate, swSupported, online],
  );

  return <PwaCtx.Provider value={value}>{children}</PwaCtx.Provider>;
}
