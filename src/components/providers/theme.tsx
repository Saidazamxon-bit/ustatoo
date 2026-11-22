"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { store } from "@/lib/client-storage";
import { cn } from "@/lib/utils";

export type ThemePreference = "system" | "light" | "dark";
type Resolved = "light" | "dark";

export const THEME_COLORS: Record<Resolved, string> = { light: "#FAF6F1", dark: "#14110F" };

/**
 * Sahifa chizilishidan oldin <head> da ishlaydi — tungi rejimda oq "miltillash" bo‘lmasligi uchun.
 * Mantiq ThemeProvider dagi applyTheme bilan bir xil.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var p="system";try{p=JSON.parse(localStorage.getItem("ut:theme")||'"system"')}catch(e){}var d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.setAttribute("data-theme",d?"dark":"light");r.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

function systemPrefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(resolved: Resolved, animate: boolean) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && !reduce) {
    root.classList.add("theme-transition");
    window.setTimeout(() => root.classList.remove("theme-transition"), 350);
  }
  root.setAttribute("data-theme", resolved);
  root.style.colorScheme = resolved;
  // Brauzer paneli / status bar rangi
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_COLORS[resolved]));
}

type Ctx = { preference: ThemePreference; resolved: Resolved; setPreference: (p: ThemePreference) => void; toggle: () => void };
const ThemeCtx = createContext<Ctx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme ThemeProvider ichida ishlatilishi kerak");
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPref] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<Resolved>("light");

  useEffect(() => {
    const saved = store.get<ThemePreference>("theme", "system");
    const p: ThemePreference = saved === "light" || saved === "dark" ? saved : "system";
    setPref(p);
    const r: Resolved = p === "system" ? (systemPrefersDark() ? "dark" : "light") : p;
    setResolved(r);
    applyTheme(r, false);
  }, []);

  // "Tizim" tanlanganda qurilma sozlamasi o‘zgarishini kuzatamiz
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const r: Resolved = mq.matches ? "dark" : "light";
      setResolved(r);
      applyTheme(r, true);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPref(p);
    store.set("theme", p);
    const r: Resolved = p === "system" ? (systemPrefersDark() ? "dark" : "light") : p;
    setResolved(r);
    applyTheme(r, true);
  }, []);

  const toggle = useCallback(() => setPreference(resolved === "dark" ? "light" : "dark"), [resolved, setPreference]);

  return <ThemeCtx.Provider value={{ preference, resolved, setPreference, toggle }}>{children}</ThemeCtx.Provider>;
}

/** Dumaloq tugma: kunduzgi ↔ tungi (sarlavhalar uchun) */
export function ThemeToggleButton({ className }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  const dark = resolved === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Kunduzgi rejimga o‘tish" : "Tungi rejimga o‘tish"}
      title={dark ? "Kunduzgi rejim" : "Tungi rejim"}
      className={cn(
        "relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface text-ink shadow-[var(--shadow-soft)] transition hover:bg-brand-50 active:scale-95",
        className,
      )}
    >
      <Sun className={cn("absolute h-5 w-5 transition-all duration-500", dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100")} />
      <Moon className={cn("absolute h-5 w-5 transition-all duration-500", dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0")} />
    </button>
  );
}

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "Tizim", icon: Monitor },
  { value: "light", label: "Kunduzgi", icon: Sun },
  { value: "dark", label: "Tungi", icon: Moon },
];

/** Uch holatli tanlov: Tizim / Kunduzgi / Tungi (sozlamalar uchun) */
export function ThemeSelector({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Ko‘rinish mavzusi" className={cn("grid grid-cols-3 gap-1 rounded-2xl bg-cream p-1", className)}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl py-2.5 text-sm font-semibold transition",
              active ? "bg-surface text-brand-600 shadow-[var(--shadow-soft)]" : "text-ink-2 hover:text-ink",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
