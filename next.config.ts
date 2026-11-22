import type { NextConfig } from "next";

// Har bir build uchun yagona identifikator: Service Worker va "Yangilanishlar markazi"
// shu orqali yangi versiyani aniqlaydi. Vercel'da commit SHA, lokalda vaqt belgisi.
// Config build paytida bir nechta jarayonda yuklanadi — qiymat bir marta hisoblanib,
// process.env orqali ishchi jarayonlarga meros qilinadi (server va brauzer kodi bir xil ID oladi).
const BUILD_ID = (process.env.NEXT_PUBLIC_BUILD_ID ||= (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 8) || `local-${Date.now().toString(36)}`);
const BUILD_TIME = (process.env.NEXT_PUBLIC_BUILD_TIME ||= new Date().toISOString());

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_BUILD_ID: BUILD_ID,
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "6mb" },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // microphone=(self) — ovozli qidiruv ishlashi uchun
          { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(self)" },
        ],
      },
      {
        // Service Worker har doim yangi tekshirilsin (HTTP kesh yangilanishni to‘sib qo‘ymasin)
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }],
      },
      {
        // Android ilovasi: yangi versiya chiqqanda eski fayl keshdan berilmasin, nomi tushunarli bo‘lsin
        source: "/downloads/ustatop-android.apk",
        headers: [
          { key: "Content-Type", value: "application/vnd.android.package-archive" },
          { key: "Content-Disposition", value: 'attachment; filename="UstaTop.apk"' },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Ulashish uchun qisqa havolalar
      { source: "/android", destination: "/ilova#android", permanent: false },
      { source: "/apk", destination: "/downloads/ustatop-android.apk", permanent: false },
    ];
  },
};

export default nextConfig;
