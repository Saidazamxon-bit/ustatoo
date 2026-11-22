import type { Metadata, Viewport } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast";
import { SessionProvider, type SessionUser } from "@/components/providers/session";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { unreadMessagesCount } from "@/server/services/chat";
import { siteUrl } from "@/lib/utils";

const urbanist = Urbanist({ subsets: ["latin", "latin-ext"], variable: "--font-urbanist", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "UstaTop — barcha xizmatlar bir joyda", template: "%s | UstaTop" },
  description:
    "UstaTop — O‘zbekistondagi ishonchli ustalar platformasi. Elektrik, santexnik, konditsioner, mebel, kafel ustalarini toping, narxlarni solishtiring va onlayn buyurtma bering.",
  keywords: ["usta", "usta chaqirish", "elektrik", "santexnik", "konditsioner ustasi", "Toshkent", "UstaTop"],
  applicationName: "UstaTop",
  openGraph: { type: "website", locale: "uz_UZ", siteName: "UstaTop" },
  icons: { icon: "/favicon.svg" },
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
            {children}
          </SessionProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
