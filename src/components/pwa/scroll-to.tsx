"use client";

import { useEffect } from "react";

/** Sahifa ochilganda berilgan bo‘limga silliq o‘tadi (masalan, APK yuklangach yo‘riqnomaga) */
export function ScrollTo({ id }: { id: string }) {
  useEffect(() => {
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    return () => clearTimeout(t);
  }, [id]);
  return null;
}
