// Android (TWA) ilova uchun launcher ikonkalari, splash va Google Play grafikalarini yaratadi.
// Ishga tushirish: node scripts/generate-android-assets.mjs
import { createRequire } from "node:module";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.resolve(import.meta.dirname, "..");
const RES = path.join(ROOT, "android/app/src/main/res");
const STORE = path.join(ROOT, "android/store");

const mark = (color = "#fff") => `
  <path d="M10 24.5c0-6.2 4.5-11 10-11s10 4.8 10 11" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <path d="M20 13.5v5" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <rect x="7.5" y="24" width="25" height="4.2" rx="2.1" fill="${color}"/>`;
const grad = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8893F"/><stop offset="1" stop-color="#E05D12"/></linearGradient></defs>`;

const svg = {
  // Eski launcherlar uchun: yumaloq burchakli kvadrat
  legacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${grad}<rect x="2" y="2" width="44" height="44" rx="10" fill="url(#g)"/><g transform="translate(24 24) scale(0.9) translate(-20 -20.5)">${mark()}</g></svg>`,
  round: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${grad}<circle cx="24" cy="24" r="22" fill="url(#g)"/><g transform="translate(24 24) scale(0.82) translate(-20 -20.5)">${mark()}</g></svg>`,
  // Adaptive foreground: 108dp kanvas, belgi markaziy 66dp xavfsiz zonada
  foreground: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><g transform="translate(54 54) scale(1.45) translate(-20 -20.5)">${mark()}</g></svg>`,
  background: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108">${grad}<rect width="108" height="108" fill="url(#g)"/></svg>`,
  monochrome: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108"><g transform="translate(54 54) scale(1.45) translate(-20 -20.5)">${mark("#000")}</g></svg>`,
  splash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${grad}<rect width="40" height="40" rx="10" fill="url(#g)"/>${mark()}</svg>`,
  playIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${grad}<rect width="40" height="40" fill="url(#g)"/><g transform="translate(20 20) scale(0.72) translate(-20 -20.5)">${mark()}</g></svg>`,
};

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const browser = await chromium.launch();
const page = await browser.newPage();
async function render(svgText, w, h, file, transparent = true) {
  mkdirSync(path.dirname(file), { recursive: true });
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svgText.replace("<svg ", `<svg width="${w}" height="${h}" style="display:block" `)}</body></html>`);
  await page.screenshot({ path: file, omitBackground: transparent });
}

for (const [d, s] of Object.entries(DENSITIES)) {
  const dir = path.join(RES, `mipmap-${d}`);
  await render(svg.legacy, 48 * s, 48 * s, path.join(dir, "ic_launcher.png"));
  await render(svg.round, 48 * s, 48 * s, path.join(dir, "ic_launcher_round.png"));
  await render(svg.foreground, 108 * s, 108 * s, path.join(dir, "ic_launcher_foreground.png"));
  await render(svg.background, 108 * s, 108 * s, path.join(dir, "ic_launcher_background.png"), false);
  await render(svg.monochrome, 108 * s, 108 * s, path.join(dir, "ic_launcher_monochrome.png"));
  console.log("mipmap", d);
}
await render(svg.splash, 384, 384, path.join(RES, "drawable-nodpi/splash.png"));

// Google Play listing grafikalari
await render(svg.playIcon, 512, 512, path.join(STORE, "play-icon-512.png"), false);
const shot = (f) => `data:image/png;base64,${readFileSync(path.join(ROOT, "public/img/app", f)).toString("base64")}`;
const phone = (f, right, top, rot) => `<div style="position:absolute;right:${right}px;top:${top}px;width:200px;height:433px;border-radius:34px;background:#1F1A17;padding:7px;transform:rotate(${rot}deg);box-shadow:0 30px 60px -20px rgba(84,52,24,.55)"><img src="${shot(f)}" style="width:100%;height:100%;border-radius:28px;object-fit:cover;object-position:top"/></div>`;
await page.setViewportSize({ width: 1024, height: 500 });
await page.setContent(`<html><body style="margin:0;width:1024px;height:500px;overflow:hidden;font-family:Urbanist,system-ui,sans-serif;background:linear-gradient(135deg,#FAF6F1 0%,#FFE8D5 100%);position:relative">
  <div style="position:absolute;right:-80px;top:-120px;width:460px;height:460px;border-radius:50%;background:radial-gradient(circle,rgba(244,119,33,.35),transparent 70%)"></div>
  <div style="position:absolute;left:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center">
    <div style="display:flex;align-items:center;gap:18px">
      <div style="width:96px;height:96px;border-radius:26px;overflow:hidden;box-shadow:0 14px 30px rgba(244,119,33,.4)">${svg.splash.replace("<svg ", '<svg width="96" height="96" ')}</div>
      <div style="font-size:56px;font-weight:800;color:#1F1A17;letter-spacing:-1.5px">Usta<span style="color:#F47721">Top</span></div>
    </div>
    <div style="margin-top:26px;font-size:44px;font-weight:800;color:#1F1A17;line-height:1.1;letter-spacing:-1px">Barcha xizmatlar<br/><span style="color:#F47721">bir joyda</span></div>
    <div style="margin-top:14px;font-size:22px;color:#4A423C">Ishonchli ustalar · Onlayn buyurtma · Tez to‘lov</div>
  </div>
  ${phone("screen-master.png", 40, 70, 8)}
  ${phone("screen-home.png", 200, 40, -6)}
</body></html>`);
await page.screenshot({ path: path.join(STORE, "feature-graphic-1024x500.png") });
console.log("store graphics");
await browser.close();
