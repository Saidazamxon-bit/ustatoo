import { TopHeader } from "@/components/layout/top-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { getSettings } from "@/server/settings";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      {settings.maintenanceMessage && (
        <div className="bg-night px-4 py-2 text-center text-sm font-medium text-white">{settings.maintenanceMessage}</div>
      )}
      <TopHeader />
      <main className="pb-nav mx-auto min-h-[70dvh] w-full max-w-7xl px-4 sm:px-6 lg:px-8">{children}</main>
      <Footer settings={settings} />
      <BottomNav />
    </>
  );
}
