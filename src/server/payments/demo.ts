import type { PaymentMethod } from "@/lib/constants";
import type { CheckoutContext, PaymentProvider } from "./types";

/** Demo provayder: platformaning ichki "to‘lov oynasi"ga yo‘naltiradi (pul yechilmaydi). */
export class DemoProvider implements PaymentProvider {
  mode = "demo" as const;
  constructor(public method: Exclude<PaymentMethod, "CASH">) {}
  async createCheckout(ctx: CheckoutContext) {
    return { redirectUrl: `/tolov/${ctx.orderId}/demo/${ctx.paymentId}` };
  }
}
