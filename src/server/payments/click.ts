import type { CheckoutContext, PaymentProvider } from "./types";

/**
 * Click.uz integratsiyasi (live).
 * Kerakli env: CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY.
 * Click "Prepare/Complete" callback'lari /api/payments/click/callback ga ulanadi
 * (imzo: md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)).
 */
export class ClickProvider implements PaymentProvider {
  method = "CLICK" as const;
  mode = "live" as const;

  static isConfigured() {
    return Boolean(process.env.CLICK_SERVICE_ID && process.env.CLICK_MERCHANT_ID && process.env.CLICK_SECRET_KEY);
  }

  async createCheckout(ctx: CheckoutContext) {
    const url = new URL("https://my.click.uz/services/pay");
    url.searchParams.set("service_id", process.env.CLICK_SERVICE_ID!);
    url.searchParams.set("merchant_id", process.env.CLICK_MERCHANT_ID!);
    url.searchParams.set("amount", ctx.amount.toFixed(2));
    url.searchParams.set("transaction_param", ctx.paymentId);
    url.searchParams.set("return_url", ctx.returnUrl);
    return { redirectUrl: url.toString() };
  }
}
