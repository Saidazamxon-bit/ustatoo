"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { STORAGE_SCHEMA_VERSION } from "./version";

/**
 * Brauzerdagi lokal saqlash uchun yagona, xavfsiz qatlam.
 * - Barcha kalitlar "ut:" prefiksi bilan (boshqa ma'lumotlarga tegilmaydi).
 * - localStorage yopiq bo‘lsa (Safari private mode) xatolik ilovani buzmaydi.
 * - Sxema versiyasi va migratsiyalar: yangilanishdan keyin eski formatdagi
 *   ma'lumotlar yo‘qolmaydi, yangi formatga o‘tkaziladi.
 */
const PREFIX = "ut:";

export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* kvota to‘lgan yoki taqiqlangan — jim o‘tamiz */
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {}
  },
  keys(prefix = ""): string[] {
    try {
      return Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX + prefix))
        .map((k) => k.slice(PREFIX.length));
    } catch {
      return [];
    }
  },
};

type Migration = (s: typeof store) => void;

/**
 * Sxema migratsiyalari: indeks = qaysi versiyaga o‘tkazadi.
 * Kelajakda format o‘zgarsa, STORAGE_SCHEMA_VERSION oshiriladi va bu yerga funksiya qo‘shiladi.
 * Migratsiyalar faqat ma'lumotni o‘zgartiradi, hech qachon ommaviy o‘chirmaydi.
 */
const MIGRATIONS: Record<number, Migration> = {
  1: () => {
    /* boshlang‘ich sxema — o‘zgartirish yo‘q */
  },
};

export function runStorageMigrations() {
  const current = store.get<number>("schema", 0);
  if (current >= STORAGE_SCHEMA_VERSION) return;
  for (let v = current + 1; v <= STORAGE_SCHEMA_VERSION; v++) {
    try {
      MIGRATIONS[v]?.(store);
      store.set("schema", v);
    } catch (err) {
      // Migratsiya xato bo‘lsa, ma'lumot o‘chirilmaydi — keyingi ochilishda qayta uriniladi
      console.error("[storage] migratsiya xatosi", v, err);
      return;
    }
  }
}

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // qoralamalar 7 kun saqlanadi

/**
 * Qoralama: forma yoki xabar matnini avtomatik saqlaydi va sahifa qayta yuklansa
 * (masalan, ilova yangilanganda) tiklaydi. Muvaffaqiyatli yuborilgach clear() chaqiriladi.
 */
export function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [restored, setRestored] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const saved = store.get<{ v: T; t: number } | null>(`draft:${key}`, null);
    if (saved && Date.now() - saved.t < DRAFT_TTL_MS) {
      setValue(saved.v);
      setRestored(true);
    }
    loaded.current = true;
  }, [key]);

  useEffect(() => {
    if (!loaded.current) return;
    const id = setTimeout(() => store.set(`draft:${key}`, { v: value, t: Date.now() }), 250);
    return () => clearTimeout(id);
  }, [key, value]);

  const clear = useCallback(() => {
    store.remove(`draft:${key}`);
    setRestored(false);
  }, [key]);

  return [value, setValue, { clear, restored }] as const;
}

/** Chiqishda shaxsiy qoralamalarni tozalash (boshqa foydalanuvchi ko‘rmasligi uchun) */
export function clearUserDrafts() {
  for (const k of store.keys("draft:")) store.remove(k);
}
