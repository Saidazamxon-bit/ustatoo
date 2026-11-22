import "server-only";
import type { PaymentMethod } from "@/lib/constants";
import type { PaymentProvider } from "./types";
import { DemoProvider } from "./demo";
import { ClickProvider } from "./click";
import { PaymeProvider } from "./payme";

/**
 * To‘lov rejimi: PAYMENTS_MODE=live bo‘lsa va provayder kalitlari sozlangan bo‘lsa
 * haqiqiy provayder ishlatiladi, aks holda demo provayder.
 * Uzcard/Humo kartalari odatda agregator (Click/Payme/Paynet) orqali qabul qilinadi —
 * live rejimda ular Payme checkout orqali yo‘naltiriladi.
 */
export function getProvider(method: Exclude<PaymentMethod, "CASH">, demoSetting = true): PaymentProvider {
  const live = process.env.PAYMENTS_MODE === "live" && !demoSetting;
  if (live) {
    if (method === "CLICK" && ClickProvider.isConfigured()) return new ClickProvider();
    if ((method === "PAYME" || method === "UZCARD" || method === "HUMO") && PaymeProvider.isConfigured())
      return new PaymeProvider(method);
  }
  return new DemoProvider(method);
}

export const DEMO_SMS_CODE = "123456";
