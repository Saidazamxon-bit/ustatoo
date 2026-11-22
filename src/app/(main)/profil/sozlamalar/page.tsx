import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { PageHeader } from "@/components/layout/page-header";
import { LogoutButton } from "@/components/forms/logout-button";
import { SettingsForm } from "./settings-form";
import Link from "next/link";
import { APP_VERSION } from "@/lib/version";
import { ThemeSelector } from "@/components/providers/theme";

export const metadata: Metadata = { title: "Sozlamalar", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requirePageUser("/profil/sozlamalar");
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Sozlamalar" backHref="/profil" />
      <section className="card mb-5 space-y-3 p-5">
        <div>
          <p className="font-bold">Ko‘rinish</p>
          <p className="text-sm text-muted">“Tizim” — qurilmangiz sozlamasiga qarab avtomatik almashadi</p>
        </div>
        <ThemeSelector />
      </section>
      <SettingsForm initial={{ notifyOrders: user.notifyOrders, notifyMessages: user.notifyMessages, notifyPromos: user.notifyPromos }} />
      <div className="card mt-5 flex items-center justify-between gap-3 p-5 text-sm">
        <div>
          <p className="font-bold">Ilova versiyasi</p>
          <p className="text-muted">UstaTop v{APP_VERSION}</p>
        </div>
        <div className="flex gap-3 font-semibold text-brand-600">
          <Link href="/ilova">O‘rnatish</Link>
          <Link href="/yangilanishlar">Yangilanishlar</Link>
        </div>
      </div>
      <div className="card mt-5 p-5 text-sm">
        <p className="font-bold">Yordam</p>
        <p className="mt-1 text-muted">Savollar bo‘yicha qo‘llab-quvvatlash xizmati:</p>
        <a className="mt-2 block font-semibold text-brand-600" href={`tel:${s.supportPhone.replace(/\s/g, "")}`}>{s.supportPhone}</a>
        <a className="block font-semibold text-brand-600" href={`mailto:${s.supportEmail}`}>{s.supportEmail}</a>
      </div>
      <LogoutButton className="mt-5" />
    </div>
  );
}
