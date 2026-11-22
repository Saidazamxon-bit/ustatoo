import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast";
import { SessionProvider, type SessionUser } from "@/components/providers/session";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { PwaUi } from "@/components/pwa/pwa-ui";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { unreadMessagesCount } from "@/server/services/chat";
import { siteUrl } from "@/lib/utils";

// iOS splash ekranlari (scripts/generate-pwa-assets.mjs bilan bir xil o‘lchamlar)
const SPLASH: [number, number, number, number, number][] = [
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

const urbanist = Urbanist({ subsets: ["latin", "latin-ext"], variable: "--font-urbanist", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "UstaTop — barcha xizmatlar bir joyda", template: "%s | UstaTop" },
  description:
    "UstaTop — O‘zbekistondagi ishonchli ustalar platformasi. Elektrik, santexnik, konditsioner, mebel, kafel ustalarini toping, narxlarni solishtiring va onlayn buyurtma bering.",
  keywords: ["usta", "usta chaqirish", "elektrik", "santexnik", "konditsioner ustasi", "Toshkent", "UstaTop"],
  applicationName: "UstaTop",
  openGraph: { type: "website", locale: "uz_UZ", siteName: "UstaTop" },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  // iOS: bosh ekrandan alohida ilova sifatida ochilishi va ochilish ekranlari
  appleWebApp: {
    capable: true,
    title: "UstaTop",
    statusBarStyle: "default",
    startupImage: SPLASH.map(([w, h, dw, dh, dpr]) => ({
      url: `/splash/splash-${w}x${h}.png`,
      media: `(device-width: ${dw}px) and (device-height: ${dh}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`,
    })),
  },
  formatDetection: { telephone: false },
  // Next 15 faqat "mobile-web-app-capable" chiqaradi; eski iOS versiyalari uchun apple- variant ham kerak
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#FAF6F1",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  let counts = { messages: 0, notifications: 0 };
  if (user) {
    const [messages, notifications] = await Promise.all([
      unreadMessagesCount(user.id),
      db.notification.count({ where: { userId: user.id, readAt: null } }),
    ]);
    counts = { messages, notifications };
  }
  const sessionUser: SessionUser | null = user
    ? {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role as SessionUser["role"],
        masterId: user.master?.id ?? null,
        region: user.region,
        district: user.district,
      }
    : null;

  return (
    <html lang="uz" className={urbanist.variable}>
      <body className="min-h-dvh font-sans">
        <ToastProvider>
          <SessionProvider user={sessionUser} initialCounts={counts}>
            <PwaProvider>
              {children}
              <PwaUi />
            </PwaProvider>
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
