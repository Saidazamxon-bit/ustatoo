import type { PaymentMethod } from "@/lib/constants";

export type CheckoutContext = {
  paymentId: string;
  orderId: string;
  orderCode: string;
  amount: number; // so‘m
  returnUrl: string; // absolyut URL
};

/**
 * To‘lov provayderi interfeysi. Har bir to‘lov tizimi (Click, Payme, Uzcard, Humo)
 * shu interfeysni amalga oshiradi. Demo va haqiqiy (live) rejimlar o‘rtasida
 * almashish src/server/payments/index.ts dagi getProvider() orqali amalga oshadi.
 */
export interface PaymentProvider {
  method: Exclude<PaymentMethod, "CASH">;
  mode: "demo" | "live";
  /** Foydalanuvchi yo‘naltiriladigan to‘lov sahifasi manzili */
  createCheckout(ctx: CheckoutContext): Promise<{ redirectUrl: string }>;
}
