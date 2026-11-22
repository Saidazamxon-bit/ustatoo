// PWA ikonkalari va iOS splash ekranlarini generatsiya qiladi (Playwright orqali).
// Ishga tushirish: node scripts/generate-pwa-assets.mjs
// Natija: public/icons/*, public/splash/*
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdirSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ICONS = path.join(ROOT, "public/icons");
const SPLASH = path.join(ROOT, "public/splash");
mkdirSync(ICONS, { recursive: true });
mkdirSync(SPLASH, { recursive: true });

const ORANGE = "#F47721";
const CREAM = "#FAF6F1";

// Logotip belgisi (kaska) — src/components/layout/logo.tsx bilan bir xil
const mark = (color = "#fff") => `
  <path d="M10 24.5c0-6.2 4.5-11 10-11s10 4.8 10 11" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 13.5v5" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <rect x="7.5" y="24" width="25" height="4.2" rx="2.1" fill="${color}"/>`;

/** any: yumaloq burchakli; maskable: to‘liq fon, belgi xavfsiz zonada; apple: to‘liq kvadrat */
const iconSvg = (kind) => {
  if (kind === "any")
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8893F"/><stop offset="1" stop-color="#E05D12"/></linearGradient></defs><rect width="40" height="40" rx="9" fill="url(#g)"/>${mark()}</svg>`;
  // maskable/apple: belgi markazda 64% hajmda
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8893F"/><stop offset="1" stop-color="#E05D12"/></linearGradient></defs><rect width="40" height="40" fill="url(#g)"/><g transform="translate(20 20) scale(${kind === "maskable" ? 0.62 : 0.78}) translate(-20 -20.5)">${mark()}</g></svg>`;
};

const ICON_JOBS = [
  { file: "icon-192.png", size: 192, kind: "any" },
  { file: "icon-512.png", size: 512, kind: "any" },
  { file: "maskable-192.png", size: 192, kind: "maskable" },
  { file: "maskable-512.png", size: 512, kind: "maskable" },
  { file: "apple-touch-icon.png", size: 180, kind: "apple" },
  { file: "favicon-32.png", size: 32, kind: "any" },
];

// iOS splash ekranlari: [kenglik, balandlik (px), qurilma kengligi, balandligi (CSS px), DPR]
export const SPLASH_SIZES = [
  [1290, 2796, 430, 932, 3],
  [1179, 2556, 393, 852, 3],
  [1284, 2778, 428, 926, 3],
  [1170, 2532, 390, 844, 3],
  [1125, 2436, 375, 812, 3],
  [1242, 2688, 414, 896, 3],
  [828, 1792, 414, 896, 2],
  [750, 1334, 375, 667, 2],
  [1640, 2360, 820, 1180, 2],
  [1668, 2388, 834, 1194, 2],
  [2048, 2732, 1024, 1366, 2],
  [1620, 2160, 810, 1080, 2],
];

const splashHtml = (w, h, dpr) => {
  const s = Math.round(96 * dpr);
  return `<html><body style="margin:0;width:${w}px;height:${h}px;background:${CREAM};display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Urbanist,ui-sans-serif,system-ui,sans-serif">
  <div style="width:${s}px;height:${s}px;border-radius:${Math.round(s * 0.24)}px;box-shadow:0 ${8 * dpr}px ${24 * dpr}px rgba(244,119,33,.35);overflow:hidden">${iconSvg("any").replace("<svg ", `<svg width="${s}" height="${s}" `)}</div>
  <div style="margin-top:${18 * dpr}px;font-size:${26 * dpr}px;font-weight:800;color:#1F1A17;letter-spacing:-0.02em">Usta<span style="color:${ORANGE}">Top</span></div>
  <div style="margin-top:${6 * dpr}px;font-size:${13 * dpr}px;color:#8C827A">Barcha xizmatlar bir joyda</div>
</body></html>`;
};

const browser = await chromium.launch();
const page = await browser.newPage();
for (const j of ICON_JOBS) {
  await page.setViewportSize({ width: j.size, height: j.size });
  await page.setContent(`<html><body style="margin:0;background:transparent">${iconSvg(j.kind).replace("<svg ", `<svg width="${j.size}" height="${j.size}" style="display:block" `)}</body></html>`);
  await page.screenshot({ path: path.join(ICONS, j.file), omitBackground: j.kind === "any" });
  console.log("icon", j.file);
}
for (const [w, h, , , dpr] of SPLASH_SIZES) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(splashHtml(w, h, dpr));
  await page.screenshot({ path: path.join(SPLASH, `splash-${w}x${h}.png`) });
  console.log("splash", `${w}x${h}`);
}
await browser.close();
