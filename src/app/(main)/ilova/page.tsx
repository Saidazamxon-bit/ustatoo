import type { Metadata } from "next";
import Link from "next/link";
import {
  Bell, Check, Download, Feather, MessageCircle, MousePointerClick, RefreshCw, Rocket, Search, ShoppingBag, Smartphone, WifiOff, Zap, PanelTopClose, ArrowRight, ShieldCheck,
} from "lucide-react";
import { LogoMark } from "@/components/layout/logo";
import { InstallButton } from "@/components/pwa/install-button";
import { InstallSteps, PhoneMockup, Reveal } from "@/components/pwa/app-showcase";
import { APP_VERSION } from "@/lib/version";
import { ANDROID_APK } from "@/lib/android";


export const metadata: Metadata = {
  title: "UstaTop ilovasi — telefoningizga o‘rnating",
  description: "UstaTop’ni Android yoki iPhone bosh ekraningizga o‘rnating: tez ochiladi, bildirishnomalar, oflayn rejim va avtomatik yangilanishlar.",
  alternates: { canonical: "/ilova" },
};

const FEATURES = [
  { icon: Search, title: "Ustalarni tez topish", text: "Kategoriya, hudud, narx va reyting bo‘yicha kerakli ustani soniyalarda toping." },
  { icon: ShoppingBag, title: "Buyurtmalarni boshqarish", text: "Buyurtma bering, holatini real vaqtda kuzating va bir bosishda to‘lang." },
  { icon: MessageCircle, title: "Ustalar bilan tez bog‘lanish", text: "Ichki chat, rasm yuborish va qo‘ng‘iroq — hammasi bir joyda." },
  { icon: Bell, title: "Bildirishnomalar", text: "Usta javob berganda, to‘lov qabul qilinganda darhol xabar olasiz." },
  { icon: Zap, title: "Qulay va tez ishlash", text: "Sahifalar keshdan ochiladi, ilova mobil telefonlar uchun moslashtirilgan." },
  { icon: WifiOff, title: "Internet bo‘lmaganda ham", text: "Avval ochilgan sahifalar oflayn ko‘rinadi, internet qaytgach ma’lumotlar yangilanadi." },
];

const BENEFITS = [
  { icon: Rocket, title: "Tez ochiladi", text: "Asosiy fayllar qurilmada saqlanadi." },
  { icon: MousePointerClick, title: "Bir bosishda kirish", text: "Bosh ekrandagi ikonka orqali." },
  { icon: PanelTopClose, title: "Brauzer interfeysisiz", text: "To‘liq ekranli, alohida ilova kabi." },
  { icon: Feather, title: "Kam joy egallaydi", text: "Do‘kondagi ilovalardan ancha yengil." },
  { icon: RefreshCw, title: "Avtomatik yangilanish", text: "Yangi versiya o‘zi yuklanadi." },
];

export default function AppPage() {
  return (
    <div className="space-y-20 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))] lg:space-y-28 lg:pt-12">
      <noscript>
        <style>{`.reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* Hero */}
      <section className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div className="pointer-events-none absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
        <div className="space-y-6 text-center lg:text-left">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1.5 text-xs font-bold text-brand-700 shadow-[var(--shadow-soft)]">
              <Smartphone className="h-3.5 w-3.5" /> Android · iPhone · iPad · Kompyuter
            </span>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <LogoMark size={72} className="rounded-[20px] drop-shadow-[0_14px_24px_rgba(244,119,33,0.4)]" />
              <div className="text-left">
                <p className="text-2xl font-extrabold tracking-tight">
                  Usta<span className="text-brand-500">Top</span>
                </p>
                <p className="text-sm text-muted">Ilova · v{APP_VERSION}</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <h1 className="text-[40px] font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[64px]">
              UstaTop <span className="bg-gradient-to-r from-brand-500 to-amber-500 bg-clip-text text-transparent">doimo yoningizda</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <p className="mx-auto max-w-lg text-lg text-muted lg:mx-0">
              Ilovani bosh ekraningizga o‘rnating — ustalarni topish, buyurtma berish va ular bilan yozishish yanada tez va qulay bo‘ladi.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <InstallButton className="w-full sm:w-auto" />
              <Link href="#imkoniyatlar" className="inline-flex items-center gap-1.5 px-4 py-3 font-semibold text-ink-2 transition hover:text-brand-600">
                Imkoniyatlar <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={400}>
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink-2 lg:justify-start">
              {["Bepul", "Ro‘yxatdan o‘tish shart emas", "Ma’lumotlaringiz xavfsiz"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-success" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={200}>
          <PhoneMockup />
        </Reveal>
      </section>

      {/* Imkoniyatlar */}
      <section id="imkoniyatlar" className="scroll-mt-24">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">Imkoniyatlar</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Kerakli hamma narsa — bir ilovada</h2>
          </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 70}>
              <div className="card group h-full p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-500 transition duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Afzalliklar */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-night px-6 py-12 text-white sm:px-12">
            <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl animate-glow" aria-hidden />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" aria-hidden />
            <div className="relative mb-10 max-w-xl">
              <p className="text-sm font-bold uppercase tracking-wider text-brand-300">Nega ilova?</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Oddiy saytdan ko‘ra qulayroq</h2>
            </div>
            <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {BENEFITS.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="h-full rounded-[1.5rem] bg-white/[0.06] p-5 ring-1 ring-white/10 transition hover:bg-white/[0.1]">
                    <Icon className="mb-3 h-6 w-6 text-brand-400" />
                    <p className="font-bold">{title}</p>
                    <p className="mt-1 text-sm text-white/65">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Android ilovasi (APK) */}
      <section id="android">
        <Reveal>
          <div className="card relative overflow-hidden p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-green-50 blur-2xl" aria-hidden />
            <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr_auto]">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#3DDC84] text-white shadow-[0_12px_24px_-10px_rgba(61,220,132,0.8)]">
                <Smartphone className="h-8 w-8" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-green-700">Android</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Android ilovasini yuklab oling</h2>
                <p className="mt-1.5 max-w-xl text-[15px] text-muted">
                  To‘liq ekranli native ilova: tezkor havolalar, tizim splash ekrani va saytdagi barcha imkoniyatlar. Google Play’da tez orada.
                </p>
                <p className="mt-2 text-xs text-muted">
                  v{ANDROID_APK.versionName} · {ANDROID_APK.sizeMb} MB · Android {ANDROID_APK.minAndroid}+ · O‘rnatishda “Noma’lum manbalardan o‘rnatish”ga ruxsat bering
                </p>
              </div>
              <a
                href={ANDROID_APK.url}
                download
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 font-semibold text-cream transition hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <Download className="h-5 w-5" /> APK yuklab olish
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Qanday o‘rnatiladi */}
      <section>
        <Reveal>
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-brand-600">3 qadam</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Qanday o‘rnatiladi?</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <InstallSteps />
        </Reveal>
      </section>

      {/* Yakuniy CTA */}
      <section>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-14 text-center text-white shadow-[var(--shadow-brand)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_45%)]" aria-hidden />
            <LogoMark size={64} className="relative mx-auto mb-5 rounded-[18px] ring-4 ring-white/30" />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">UstaTop’ni hozir o‘rnating</h2>
            <p className="relative mx-auto mt-3 max-w-md text-white/85">Bir necha soniya — va ishonchli ustalar doim qo‘l ostingizda.</p>
            <div className="relative mt-7 flex justify-center">
              <InstallButton variant="secondary" className="w-full max-w-xs text-brand-700" />
            </div>
            <p className="relative mt-5 text-sm text-white/80">
              <ShieldCheck className="mr-1 inline h-4 w-4 align-[-3px]" />
              Yangilanishlar ma’lumotlaringizni o‘chirmaydi.
              <Link href="/yangilanishlar" className="mt-1 block font-semibold underline underline-offset-2">
                Yangilanishlar tarixi
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
