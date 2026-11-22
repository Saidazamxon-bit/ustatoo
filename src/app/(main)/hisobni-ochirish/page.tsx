import type { Metadata } from "next";
import { ShieldAlert, Trash2, UserX } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Hisobni o‘chirish",
  description: "UstaTop hisobingizni va unga bog‘liq ma’lumotlarni qanday o‘chirish mumkin.",
  alternates: { canonical: "/hisobni-ochirish" },
};

/** Google Play talabi: hisobni o‘chirish uchun ochiq veb-sahifa */
export default async function DeleteAccountInfoPage() {
  const [user, s] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Hisobni o‘chirish" />
      <div className="space-y-4">
        <section className="card p-6">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-danger">
            <UserX className="h-6 w-6" />
          </span>
          <h2 className="text-xl font-bold">UstaTop hisobingizni o‘chirish</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-[15px] text-ink-2">
            <li>UstaTop’ga (sayt, ilova yoki Android ilovasi) kiring.</li>
            <li>Profil → Sozlamalar bo‘limini oching.</li>
            <li>“Hisobni o‘chirish” tugmasini bosing, parolingizni kiriting va tasdiqlang.</li>
          </ol>
          <ButtonLink href={user ? "/profil/sozlamalar" : "/kirish?next=/profil/sozlamalar"} variant="danger" className="mt-5" icon={<Trash2 className="h-4 w-4" />}>
            {user ? "Sozlamalarga o‘tish" : "Kirish va o‘chirish"}
          </ButtonLink>
        </section>
        <section className="card p-6 text-[15px] text-ink-2">
          <p className="mb-2 flex items-center gap-2 font-bold text-ink">
            <ShieldAlert className="h-5 w-5 text-brand-500" /> Nima o‘chiriladi va nima saqlanadi
          </p>
          <ul className="space-y-1.5 pl-5 [&>li]:list-disc">
            <li><b>Darhol o‘chiriladi:</b> ism, telefon, email, profil rasmi, manzil, sevimlilar, bildirishnomalar, chatdagi rasmlar; ustalar uchun — portfolio, bio va aloqa ma’lumotlari.</li>
            <li><b>Bekor qilinadi:</b> barcha faol buyurtmalar.</li>
            <li><b>Anonim saqlanadi:</b> yakunlangan buyurtmalar va sharhlar ikkinchi tomon hisobotlari uchun “O‘chirilgan foydalanuvchi” nomi bilan, shaxsingizni aniqlab bo‘lmaydigan holda.</li>
          </ul>
          <p className="mt-3">
            Hisobingizga kira olmasangiz, ro‘yxatdan o‘tgan telefon raqamingizdan{" "}
            <a href={`mailto:${s.supportEmail}?subject=Hisobni%20o%E2%80%98chirish`} className="font-semibold text-brand-600">{s.supportEmail}</a> ga yozing — so‘rovingiz 7 kun ichida bajariladi.
          </p>
        </section>
      </div>
    </div>
  );
}
