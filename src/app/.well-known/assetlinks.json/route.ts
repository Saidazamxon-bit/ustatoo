import { NextResponse } from "next/server";

/**
 * Digital Asset Links: Android ilovasi (TWA) sayt bilan bog‘langanini tasdiqlaydi —
 * shunda ilova brauzer manzil satrisiz, to‘liq ekranli ochiladi va sayt havolalari ilovada ochiladi.
 *
 * UPLOAD_KEY — android/ ilovasini imzolagan kalit (to‘g‘ridan-to‘g‘ri APK uchun).
 * Google Play "App signing" yoqilganda Play o‘z kaliti bilan qayta imzolaydi: o‘sha kalitning
 * SHA-256 barmoq izini Play Console → Setup → App signing dan olib, Vercel'da
 * ANDROID_SHA256_FINGERPRINTS (vergul bilan) env o‘zgaruvchisiga qo‘shing — qayta build shart emas.
 */
const PACKAGE_NAME = "uz.ustatop.app";
const UPLOAD_KEY = "BE:AA:D6:67:44:C0:76:B6:3F:BB:58:E6:23:FE:DB:6C:C0:67:40:4A:A8:42:A3:D3:69:04:D8:FD:96:E5:55:6E";

export const dynamic = "force-dynamic";

export function GET() {
  const extra = (process.env.ANDROID_SHA256_FINGERPRINTS || "")
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter((s) => /^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(s));
  const fingerprints = [...new Set([UPLOAD_KEY, ...extra])];
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: { namespace: "android_app", package_name: PACKAGE_NAME, sha256_cert_fingerprints: fingerprints },
      },
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
