import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { getSettings } from "@/server/settings";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati",
  description: "UstaTop qanday ma’lumotlarni yig‘adi, ulardan qanday foydalanadi va ularni qanday himoya qiladi.",
  alternates: { canonical: "/maxfiylik" },
};

const UPDATED = "22 noyabr 2026";

export default async function PrivacyPage() {
  const s = await getSettings();
  const sections: { title: string; body: React.ReactNode }[] = [
    {
      title: "1. Qanday ma’lumotlarni yig‘amiz",
      body: (
        <ul>
          <li><b>Hisob ma’lumotlari:</b> ism, telefon raqam, ixtiyoriy email, hudud va tuman, profil rasmi.</li>
          <li><b>Ustalar uchun qo‘shimcha:</b> mutaxassislik, tajriba, xizmatlar va narxlar, ish vaqti, portfolio rasmlari, ommaviy telefon va Telegram (ixtiyoriy).</li>
          <li><b>Buyurtma ma’lumotlari:</b> tanlangan xizmatlar, muammo tavsifi va rasmlari, manzil, sana va vaqt, to‘lov usuli va holati.</li>
          <li><b>Xabarlar:</b> mijoz va usta o‘rtasidagi chat matnlari va rasmlar.</li>
          <li><b>Sharhlar va shikoyatlar</b> siz yozgan matnlar bilan.</li>
          <li><b>To‘lov:</b> karta raqamining faqat niqoblangan qismi (masalan, 8600 **** **** 4512) va tranzaksiya raqami. To‘liq karta ma’lumotlari saqlanmaydi.</li>
          <li><b>Joylashuv:</b> faqat “Eng yaqin” saralashini tanlaganingizda, ruxsatingiz bilan, qurilmangizda hisoblash uchun ishlatiladi va serverda saqlanmaydi.</li>
        </ul>
      ),
    },
    {
      title: "2. Ma’lumotlardan qanday foydalanamiz",
      body: (
        <ul>
          <li>Ustalarni topish, buyurtma berish, to‘lov va chat xizmatlarini ko‘rsatish uchun.</li>
          <li>Buyurtma holati, xabarlar va to‘lovlar haqida bildirishnomalar yuborish uchun.</li>
          <li>Firibgarlik va qoidabuzarliklarning oldini olish, shikoyatlarni ko‘rib chiqish uchun.</li>
          <li>Xizmat sifatini yaxshilash uchun umumlashtirilgan (anonim) statistika.</li>
        </ul>
      ),
    },
    {
      title: "3. Ma’lumotlar kimga ko‘rinadi",
      body: (
        <ul>
          <li><b>Buyurtma bo‘yicha ikkinchi tomon:</b> usta buyurtma uchun mijozning ismi, telefoni va manzilini; mijoz ustaning ommaviy profilini ko‘radi.</li>
          <li><b>Ommaviy usta profili</b> (ism, mutaxassislik, xizmatlar, portfolio, sharhlar) hamma uchun ochiq.</li>
          <li><b>Texnik xizmat ko‘rsatuvchilar:</b> hosting (Vercel), ma’lumotlar bazasi (Neon) va fayl saqlash (Vercel Blob) — faqat xizmatni ishlatish uchun.</li>
          <li>Ma’lumotlaringizni sotmaymiz va reklama maqsadida uchinchi shaxslarga bermaymiz. Qonun talab qilgan hollar bundan mustasno.</li>
        </ul>
      ),
    },
    {
      title: "4. Xavfsizlik",
      body: (
        <ul>
          <li>Barcha aloqa HTTPS orqali shifrlanadi; parollar bcrypt bilan xeshlanadi va hech qachon ochiq saqlanmaydi.</li>
          <li>Login sessiyasi himoyalangan (httpOnly) cookie’da saqlanadi.</li>
          <li>Kirish urinishlari soni cheklangan, administrator amallari alohida huquqlar bilan himoyalangan.</li>
        </ul>
      ),
    },
    {
      title: "5. Qurilmangizda saqlanadigan ma’lumotlar",
      body: (
        <ul>
          <li>Sessiya cookie’si — tizimga kirganingizni eslab qolish uchun.</li>
          <li>Qurilma xotirasi (localStorage): tanlangan mavzu, yozilayotgan xabar va buyurtma qoralamalari, o‘rnatish taklifi holati. Chiqishda shaxsiy qoralamalar tozalanadi.</li>
          <li>Ilova keshi: tez ochilish va oflayn rejim uchun sahifalar va rasmlar.</li>
        </ul>
      ),
    },
    {
      title: "6. Saqlash muddati va hisobni o‘chirish",
      body: (
        <>
          <p>
            Ma’lumotlar hisobingiz faol bo‘lgan davrda saqlanadi. Hisobingizni istalgan vaqtda{" "}
            <Link href="/hisobni-ochirish" className="font-semibold text-brand-600 underline underline-offset-2">o‘chirishingiz mumkin</Link>.
          </p>
          <p className="mt-2">
            O‘chirilganda ism, telefon, email, rasm, manzil, sevimlilar va bildirishnomalar darhol o‘chiriladi, faol buyurtmalar bekor qilinadi. Yakunlangan buyurtmalar ikkinchi tomonning hisobotlari va
            nizolarni hal qilish uchun “O‘chirilgan foydalanuvchi” nomi bilan, shaxsingizni aniqlab bo‘lmaydigan holda saqlanadi.
          </p>
        </>
      ),
    },
    { title: "7. Bolalar", body: <p>UstaTop 16 yoshdan kichik shaxslar uchun mo‘ljallanmagan va ulardan ataylab ma’lumot yig‘maydi.</p> },
    {
      title: "8. Bog‘lanish",
      body: (
        <p>
          Savollar yoki ma’lumotlaringizga oid so‘rovlar uchun:{" "}
          <a href={`mailto:${s.supportEmail}`} className="font-semibold text-brand-600">{s.supportEmail}</a>,{" "}
          <a href={`tel:${s.supportPhone.replace(/\s/g, "")}`} className="font-semibold text-brand-600">{s.supportPhone}</a>.
        </p>
      ),
    },
    { title: "9. O‘zgarishlar", body: <p>Siyosat o‘zgarsa, ushbu sahifada yangi sana bilan e’lon qilamiz. Muhim o‘zgarishlar haqida ilovada xabar beramiz.</p> },
  ];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Maxfiylik siyosati" subtitle={`Oxirgi yangilanish: ${UPDATED}`} />
      <article className="card space-y-7 p-6 text-[15px] leading-relaxed text-ink-2 sm:p-8 [&_li]:ml-5 [&_li]:list-disc [&_li]:marker:text-brand-400 [&_ul]:space-y-1.5">
        <p>
          {s.platformName} (“biz”) mijozlar va ustalarni bog‘lovchi xizmatlar platformasi. Ushbu siyosat veb-sayt, o‘rnatiladigan ilova (PWA) va Android ilovasida qanday ma’lumotlar
          yig‘ilishini va ulardan qanday foydalanilishini tushuntiradi.
        </p>
        {sections.map((sec) => (
          <section key={sec.title}>
            <h2 className="mb-2 text-lg font-bold text-ink">{sec.title}</h2>
            {sec.body}
          </section>
        ))}
      </article>
    </div>
  );
}
