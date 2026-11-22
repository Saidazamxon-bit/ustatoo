import type { Metadata } from "next";
import { requirePageUser } from "@/server/auth";
import { getSettings } from "@/server/settings";
import { PageHeader } from "@/components/layout/page-header";
import { LogoutButton } from "@/components/forms/logout-button";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Sozlamalar", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requirePageUser("/profil/sozlamalar");
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Sozlamalar" backHref="/profil" />
      <SettingsForm initial={{ notifyOrders: user.notifyOrders, notifyMessages: user.notifyMessages, notifyPromos: user.notifyPromos }} />
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
