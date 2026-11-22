import type { CheckoutContext, PaymentProvider } from "./types";

/**
 * Payme (Paycom) integratsiyasi (live).
 * Kerakli env: PAYME_MERCHANT_ID, PAYME_SECRET_KEY.
 * Merchant API (JSON-RPC: CheckPerformTransaction, CreateTransaction, PerformTransaction ...)
 * /api/payments/payme/callback ga ulanadi; Basic auth "Paycom:<SECRET_KEY>" bilan tekshiriladi.
 * Uzcard va Humo kartalari Payme checkout sahifasida qabul qilinadi.
 */
export class PaymeProvider implements PaymentProvider {
  mode = "live" as const;
  constructor(public method: "PAYME" | "UZCARD" | "HUMO") {}

  static isConfigured() {
    return Boolean(process.env.PAYME_MERCHANT_ID && process.env.PAYME_SECRET_KEY);
  }

  async createCheckout(ctx: CheckoutContext) {
    const tiyin = Math.round(ctx.amount * 100);
    const params = `m=${process.env.PAYME_MERCHANT_ID};ac.payment_id=${ctx.paymentId};a=${tiyin};c=${ctx.returnUrl}`;
    return { redirectUrl: `https://checkout.paycom.uz/${Buffer.from(params).toString("base64")}` };
  }
}
