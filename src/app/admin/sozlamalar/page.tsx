import { getSettings } from "@/server/settings";
import { PlatformSettingsForm } from "./settings-form";

export const metadata = { title: "Platforma sozlamalari" };

export default async function AdminSettingsPage() {
  const s = await getSettings();
  return (
    <div className="max-w-2xl">
      <h1 className="mb-5 text-[28px] font-bold tracking-tight">Platforma sozlamalari</h1>
      <PlatformSettingsForm
        initial={{
          platformName: s.platformName,
          commissionPercent: Number(s.commissionPercent),
          supportPhone: s.supportPhone,
          supportEmail: s.supportEmail,
          allowMasterSignup: s.allowMasterSignup === "true",
          paymentsDemo: s.paymentsDemo === "true",
          maintenanceMessage: s.maintenanceMessage,
        }}
      />
    </div>
  );
}
