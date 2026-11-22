import Link from "next/link";
import { Bell, MapPin, ArrowRight, ShieldCheck, Clock3, Wallet } from "lucide-react";
import { getCurrentUser } from "@/server/auth";
import { getHomeData } from "@/server/services/masters";
import { getFavoriteIds } from "@/server/favorites";
import { db } from "@/server/db";
import { LogoMark } from "@/components/layout/logo";
import { Avatar, SectionHeader } from "@/components/ui/misc";
import { Scroller } from "@/components/ui/scroller";
import { SearchBar } from "@/components/search/search-bar";
import { CategoryTile } from "@/components/masters/category-tile";
import { MasterCard, MasterPill, MasterRow } from "@/components/masters/master-cards";
import { ServiceCard } from "@/components/masters/service-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { ThemeToggleButton } from "@/components/providers/theme";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [data, favs, unread] = await Promise.all([
    getHomeData(user),
    getFavoriteIds(user?.id),
    user ? db.notification.count({ where: { userId: user.id, readAt: null } }) : 0,
  ]);
  const firstName = user?.name.split(" ")[0];

  return (
    <div className="space-y-8 pt-[max(1rem,env(safe-area-inset-top))] lg:space-y-12 lg:pt-8">
      {/* Mobil yuqori qism: logotip, salomlashuv, avatar, bildirishnomalar */}
      <div className="flex items-center justify-between lg:hidden animate-fade-in">
        <Link href={user ? "/profil" : "/kirish"} className="flex items-center gap-2.5 rounded-full bg-surface py-1.5 pl-1.5 pr-1.5 shadow-[var(--shadow-soft)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50">
            <LogoMark size={30} />
          </span>
          <span className="pr-1 leading-tight">
            <span className="block text-[13px] text-muted">Xush kelibsiz!</span>
            <span className="block max-w-[120px] truncate text-[15px] font-bold">{firstName ?? "Mehmon"}</span>
          </span>
          {user ? <Avatar src={user.avatar} name={user.name} size={44} /> : <span className="rounded-full bg-brand-500 px-3.5 py-2.5 text-xs font-bold text-white">Kirish</span>}
        </Link>
        <div className="flex items-center gap-2.5">
        <ThemeToggleButton className="h-12 w-12" />
        <Link
          href={user ? "/profil/bildirishnomalar" : "/kirish?next=/profil/bildirishnomalar"}
          aria-label="Bildirishnomalar"
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-soft)]"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white ring-2 ring-cream">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>
        </div>
      </div>

      {/* Sarlavha va qidiruv */}
      <section className="grid items-center gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="space-y-5 animate-fade-up">
          <h1 className="text-[32px] font-bold leading-[1.1] tracking-tight sm:text-4xl lg:text-[56px]">
            Barcha xizmatlar
            <br />
            <span className="text-brand-500">bir joyda</span>
          </h1>
          <p className="hidden max-w-lg text-lg text-muted lg:block">
            Tekshirilgan ustalarni toping, narxlarni solishtiring va bir necha daqiqada buyurtma bering.
          </p>
          <SearchBar className="lg:max-w-xl" />
          <div className="hidden flex-wrap gap-2 lg:flex">
            {["Elektrik", "Santexnik", "Konditsioner", "Kafel", "Mebel"].map((t) => (
              <Link key={t} href={`/qidiruv?q=${t}`} className="chip hover:text-brand-600">
                {t}
              </Link>
            ))}
          </div>
        </div>
        <div className="hidden grid-cols-3 gap-3 lg:grid">
          {[
            { icon: ShieldCheck, t: "Tasdiqlangan ustalar", d: "Hujjatlari tekshirilgan" },
            { icon: Clock3, t: "Tez javob", d: "O‘rtacha 15 daqiqa" },
            { icon: Wallet, t: "Shaffof narx", d: "Click, Payme, naqd" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="card p-5">
              <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                <Icon className="h-5 w-5" />
              </span>
              <p className="font-bold leading-tight">{t}</p>
              <p className="mt-1 text-sm text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Kategoriyalar */}
      <section>
        <SectionHeader title="Kategoriyalar" href="/kategoriyalar" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {data.categories.map((c, i) => (
            <CategoryTile key={c.id} c={c} className={i >= 10 ? "hidden" : i >= 8 ? "hidden lg:block" : i >= 6 ? "hidden sm:block" : ""} />
          ))}
        </div>
      </section>

      {/* Mashhur ustalar */}
      <section>
        <SectionHeader title="Mashhur ustalar" href="/qidiruv?saralash=popular" />
        <Scroller className="lg:grid lg:grid-cols-4 lg:overflow-visible">
          {data.popular.map((m, i) => (
            <MasterCard key={m.id} m={m} favorite={favs.has(m.id)} priority={i < 2} className="w-[78%] shrink-0 snap-start sm:w-[300px] lg:w-auto" />
          ))}
        </Scroller>
      </section>

      {/* Eng yuqori reyting */}
      <section>
        <SectionHeader title="Eng yuqori reytingli ustalar" href="/qidiruv?saralash=rating" />
        <Scroller>
          {data.topRated.map((m, i) => (
            <MasterPill key={m.id} m={m} active={i === 0} />
          ))}
        </Scroller>
      </section>

      {/* Tavsiya etilgan xizmatlar */}
      <section>
        <SectionHeader title="Tavsiya etilgan xizmatlar" href="/qidiruv?tasdiqlangan=1" />
        <Scroller className="lg:grid lg:grid-cols-4 lg:overflow-visible">
          {data.recommended.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </Scroller>
      </section>

      {/* Yaqin atrofdagi ustalar */}
      <section>
        <SectionHeader
          title="Yaqin atrofdagi ustalar"
          href={`/qidiruv?saralash=near&hudud=${encodeURIComponent(data.region)}${user?.district ? `&tuman=${encodeURIComponent(user.district)}` : ""}`}
        />
        <p className="-mt-2 mb-3 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-brand-500" /> {user?.district ? `${user.district}, ` : ""}
          {data.region}
        </p>
        {data.nearby.length ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.nearby.slice(0, 6).map((m) => (
              <MasterRow key={m.id} m={m} favorite={favs.has(m.id)} />
            ))}
          </div>
        ) : (
          <EmptyState title="Yaqin atrofda usta topilmadi" description="Boshqa hududdagi ustalarni qidirib ko‘ring." action={<ButtonLink href="/qidiruv">Qidirish</ButtonLink>} />
        )}
      </section>

      {/* Usta bo‘lish banneri */}
      {user?.role !== "MASTER" && (
        <section className="relative overflow-hidden rounded-[2rem] bg-night p-6 text-white sm:p-10">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-brand-500/40 blur-3xl" />
          <div className="relative max-w-lg space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Ustalar uchun</p>
            <h2 className="text-2xl font-bold sm:text-3xl">Mijozlaringizni UstaTop’da toping</h2>
            <p className="text-white/70">Profil yarating, xizmatlaringiz va narxlarni joylang, buyurtmalarni qabul qiling va daromadingizni kuzating.</p>
            <ButtonLink href="/royxatdan-otish?rol=usta" className="mt-2" icon={<ArrowRight className="h-4 w-4" />}>
              Usta bo‘lib qo‘shilish
            </ButtonLink>
          </div>
        </section>
      )}

      {/* Yangi qo‘shilgan ustalar */}
      <section>
        <SectionHeader title="Yangi qo‘shilgan ustalar" href="/qidiruv?saralash=new" />
        <Scroller className="lg:grid lg:grid-cols-4 lg:overflow-visible">
          {data.newest.map((m) => (
            <MasterCard key={m.id} m={m} favorite={favs.has(m.id)} className="w-[78%] shrink-0 snap-start sm:w-[300px] lg:w-auto" />
          ))}
        </Scroller>
      </section>
    </div>
  );
}
