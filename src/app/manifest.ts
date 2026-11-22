import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "UstaTop — barcha xizmatlar bir joyda",
    short_name: "UstaTop",
    description: "Ishonchli ustalarni toping, narxlarni solishtiring va bir necha daqiqada buyurtma bering.",
    lang: "uz",
    dir: "ltr",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#FAF6F1",
    theme_color: "#FAF6F1",
    categories: ["business", "lifestyle", "utilities"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/img/app/screen-home.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Bosh sahifa" },
      { src: "/img/app/screen-master.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Usta profili" },
      { src: "/img/app/screen-payment.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "To‘lov" },
      { src: "/img/app/screen-desktop.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "UstaTop kompyuterda" },
    ],
    shortcuts: [
      { name: "Usta qidirish", short_name: "Qidiruv", url: "/qidiruv?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Buyurtmalarim", short_name: "Buyurtmalar", url: "/buyurtmalar?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Xabarlar", url: "/xabarlar?source=pwa", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
