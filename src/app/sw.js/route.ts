import { APP_VERSION, BUILD_ID } from "@/lib/version";

export const dynamic = "force-dynamic";

/**
 * UstaTop Service Worker.
 *
 * Xavfsizlik tamoyillari:
 *  - Yangi versiya o‘rnatiladi, lekin foydalanuvchi "Hozir yangilash" bosmaguncha
 *    faollashmaydi (skipWaiting faqat xabar orqali) — joriy ish to‘xtatilmaydi.
 *  - O‘rnatish (precache) xato bo‘lsa, brauzer yangi SW ni bekor qiladi va eski versiya
 *    ishlashda davom etadi.
 *  - Faqat "ustatop-" prefiksli eski keshlar o‘chiriladi. localStorage, IndexedDB va
 *    cookie (login sessiyasi) ga hech qachon tegilmaydi.
 *  - POST/PATCH/DELETE so‘rovlari ushlanmaydi: buyurtma yoki to‘lov internet yo‘q
 *    paytda "muvaffaqiyatli" ko‘rsatilmaydi.
 *  - API GET so‘rovlari keshlanmaydi (eskirgan ma'lumot ko‘rsatilmasin).
 */
function serviceWorkerSource() {
  // SW_REVISION — qayta build qilmasdan Service Worker yangilanishini majburlash uchun (ixtiyoriy)
  const revision = process.env.SW_REVISION ? ` rev:${process.env.SW_REVISION}` : "";
  return `/* UstaTop Service Worker — v${APP_VERSION} (${BUILD_ID})${revision} */
const VERSION = ${JSON.stringify(APP_VERSION)};
const BUILD = ${JSON.stringify(BUILD_ID)};
const PRECACHE = "ustatop-precache-" + BUILD;
const PAGES = "ustatop-pages-v1";
const ASSETS = "ustatop-assets-v1";
const IMAGES = "ustatop-images-v1";
const KEEP = [PRECACHE, PAGES, ASSETS, IMAGES];
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];
const LIMITS = { [PAGES]: 40, [ASSETS]: 400, [IMAGES]: 200 };
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })))
    )
  );
  // skipWaiting chaqirilmaydi: yangi versiya foydalanuvchi roziligi bilan faollashadi.
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((n) => n.startsWith("ustatop-") && !KEEP.includes(n)).map((n) => caches.delete(n))
      );
      if (self.registration.navigationPreload) {
        try { await self.registration.navigationPreload.enable(); } catch (e) {}
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "SKIP_WAITING") self.skipWaiting();
  if (data.type === "GET_VERSION" && event.source) {
    event.source.postMessage({ type: "VERSION", version: VERSION, build: BUILD });
  }
  if (data.type === "CLEAR_USER_CACHE") {
    // Chiqishda shaxsiy sahifalar keshini tozalash (boshqa foydalanuvchi ko‘rmasin)
    event.waitUntil(caches.delete(PAGES));
  }
});

async function trim(cacheName) {
  const max = LIMITS[cacheName];
  if (!max) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

function offlineApiResponse() {
  return new Response(
    JSON.stringify({ error: { message: "Internet aloqasi yo‘q. Ulanishni tekshirib, qayta urinib ko‘ring.", offline: true } }),
    { status: 503, headers: { "Content-Type": "application/json; charset=utf-8" } }
  );
}

async function pageFromCache(request) {
  const cache = await caches.open(PAGES);
  return (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
}

async function navigationHandler(event) {
  const request = event.request;
  const network = (async () => {
    const preload = await event.preloadResponse;
    const response = preload || (await fetch(request));
    const type = response.headers.get("content-type") || "";
    if (response.ok && response.type === "basic" && !response.redirected && type.includes("text/html")) {
      const copy = response.clone();
      event.waitUntil(
        caches.open(PAGES).then((c) => c.put(request, copy)).then(() => trim(PAGES)).catch(() => {})
      );
    }
    return response;
  })();
  try {
    // Sekin tarmoqda keshdagi nusxani ko‘rsatamiz, tarmoq javobi keshni yangilaydi
    const timeout = new Promise((resolve) => setTimeout(() => resolve("timeout"), NETWORK_TIMEOUT_MS));
    const first = await Promise.race([network, timeout]);
    if (first !== "timeout") return first;
    const cached = await pageFromCache(request);
    return cached || (await network);
  } catch (err) {
    const cached = await pageFromCache(request);
    if (cached) return cached;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response("Internet aloqasi yo‘q", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function cacheFirst(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response.ok && response.type === "basic") {
    event.waitUntil(cache.put(event.request, response.clone()).then(() => trim(cacheName)).catch(() => {}));
  }
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);
  const network = fetch(event.request)
    .then((response) => {
      if (response.ok && response.type === "basic") {
        event.waitUntil(cache.put(event.request, response.clone()).then(() => trim(cacheName)).catch(() => {}));
      }
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // mutatsiyalar har doim to‘g‘ridan-to‘g‘ri serverga
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (url.pathname.startsWith("/api/")) {
    if (url.pathname === "/api/stream") return; // SSE ni ushlamaymiz
    event.respondWith(fetch(request).catch(() => offlineApiResponse()));
    return;
  }

  // Next.js RSC so‘rovlari: tarmoq bo‘lmasa Next o‘zi to‘liq navigatsiyaga o‘tadi
  if (request.headers.get("RSC") === "1" || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(navigationHandler(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(event, ASSETS));
    return;
  }

  if (
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/img/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/splash/") ||
    /\\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event, IMAGES));
  }
});
`;
}

export function GET() {
  return new Response(serviceWorkerSource(), {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Service-Worker-Allowed": "/",
    },
  });
}
