import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Award, Briefcase, CalendarClock, Clock, MapPin, Phone, Send, Star, ExternalLink, ShieldCheck, Pencil } from "lucide-react";
import { getCurrentUser } from "@/server/auth";
import { db } from "@/server/db";
import { getMasterProfile, getSimilarMasters } from "@/server/services/masters";
import { getFavoriteIds } from "@/server/favorites";
import { Avatar, Rating, SmartImage, Stars, VerifiedBadge, Badge } from "@/components/ui/misc";
import { Scroller } from "@/components/ui/scroller";
import { MasterPill } from "@/components/masters/master-cards";
import { BackButton, ContactButtons, ShareButton } from "@/components/masters/profile-actions";
import { ServiceSelector } from "@/components/masters/service-selector";
import { PortfolioGallery } from "@/components/masters/portfolio-gallery";
import { ComplaintButton } from "@/components/forms/complaint-button";
import { FavoriteButton } from "@/components/masters/favorite-button";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { WEEKDAYS } from "@/lib/constants";
import { dateLong, experienceLabel, money, phone as fmtPhone, timeAgo, tzParts } from "@/lib/format";
import { siteUrl } from "@/lib/utils";
import { truncate } from "@/lib/text";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ xizmat?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const m = await db.masterProfile.findUnique({ where: { id }, include: { user: { select: { name: true } }, category: true } });
  if (!m) return { title: "Usta topilmadi" };
  const title = `${m.user.name} — ${m.specialty}, ${m.district}`;
  const description = truncate(`${m.specialty}, ${m.experienceYears} yillik tajriba. Reyting ${m.rating || "yangi"}. ${m.bio}`, 160);
  return {
    title,
    description,
    alternates: { canonical: `/ustalar/${m.id}` },
    openGraph: { title, description, images: m.coverImage ? [m.coverImage] : [m.category.image], type: "profile" },
  };
}

function workDaysLabel(days: string) {
  const set = days.split(",").map(Number);
  if (set.length === 7) return "Har kuni";
  const names = WEEKDAYS.filter((d) => set.includes(d.value)).map((d) => d.short);
  const contiguous = set.every((d, i) => i === 0 || d === set[i - 1] + 1);
  return contiguous && names.length > 2 ? `${names[0]}–${names[names.length - 1]}` : names.join(", ");
}

function isOpenNow(m: { workDays: string; workStart: string; workEnd: string }) {
  // Ish vaqti Toshkent vaqti bo‘yicha tekshiriladi (server UTC da ishlaydi)
  const now = tzParts(new Date());
  const day = now.weekday === 0 ? 7 : now.weekday;
  const hm = `${String(now.hours).padStart(2, "0")}:${String(now.minutes).padStart(2, "0")}`;
  return m.workDays.split(",").map(Number).includes(day) && hm >= m.workStart && hm < m.workEnd;
}

export default async function MasterProfilePage({ params, searchParams }: Props) {
  const { id } = await params;
  const { xizmat } = await searchParams;
  const [m, user] = await Promise.all([getMasterProfile(id), getCurrentUser()]);
  if (!m) notFound();
  const [similar, favs, ratingDist] = await Promise.all([
    getSimilarMasters(m.categoryId, m.id),
    getFavoriteIds(user?.id),
    db.review.groupBy({ by: ["rating"], where: { masterId: m.id, status: "VISIBLE" }, _count: { _all: true } }),
  ]);
  const isSelf = user?.id === m.userId;
  if (!isSelf) db.masterProfile.update({ where: { id: m.id }, data: { popularity: { increment: 1 } } }).catch(() => {});

  const cover = m.coverImage ?? m.category.image;
  const verified = m.verification === "APPROVED";
  const openNow = isOpenNow(m);
  const lat = m.lat ?? 41.31;
  const lng = m.lng ?? 69.28;
  const d = 0.02;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${m.user.name} — ${m.specialty}`,
    image: siteUrl(cover),
    url: siteUrl(`/ustalar/${m.id}`),
    address: { "@type": "PostalAddress", addressLocality: m.district, addressRegion: m.region, addressCountry: "UZ" },
    geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
    priceRange: `${m.priceFrom}+ UZS`,
    ...(m.reviewCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: m.rating, reviewCount: m.reviewCount } } : {}),
  };

  const sections = [
    ["haqida", "Haqida"],
    ["xizmatlar", "Xizmatlar"],
    ["portfolio", "Portfolio"],
    ["sharhlar", "Sharhlar"],
    ["joylashuv", "Joylashuv"],
    ["aloqa", "Aloqa"],
  ];

  return (
    <div className="pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero: katta cover rasm, statistik "chip"lar */}
      <section className="relative -mx-4 overflow-hidden sm:-mx-6 lg:mx-0 lg:mt-6 lg:rounded-[2rem]">
        <div className="relative h-[52dvh] max-h-[480px] min-h-[340px] bg-gradient-to-b from-brand-200 to-brand-100 lg:h-[420px]">
          <SmartImage src={cover} alt={`${m.user.name} — ${m.specialty}`} sizes="(max-width:1024px) 100vw, 1200px" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-200/50 via-transparent to-black/45" />
        </div>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
          <BackButton />
          <span className="rounded-full bg-surface/80 px-4 py-2 text-[15px] font-bold backdrop-blur lg:hidden">Usta profili</span>
          <ShareButton title={`${m.user.name} — UstaTop`} />
        </div>
        <div className="absolute inset-x-0 bottom-10 grid grid-cols-3 gap-2.5 px-4 sm:px-6 lg:bottom-6 lg:left-auto lg:w-[460px]">
          {[
            { icon: Award, v: `${m.completedJobs}`, l: "Ishlar" },
            { icon: Star, v: m.rating ? m.rating.toFixed(1) : "Yangi", l: `${m.reviewCount} sharh` },
            { icon: Briefcase, v: experienceLabel(m.experienceYears), l: "Tajriba" },
          ].map(({ icon: Icon, v, l }, i) => (
            <div key={l} style={{ animationDelay: `${i * 70}ms` }} className="glass flex items-center gap-2 rounded-2xl p-2 shadow-[var(--shadow-soft)] animate-fade-up">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[15px] font-bold">{v}</span>
                <span className="block truncate text-[11px] text-ink-2">{l}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="relative -mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_380px] lg:gap-8">
        <div className="min-w-0 space-y-6">
          {/* Asosiy ma'lumot */}
          <section className="card relative p-5 animate-fade-up">
            <div className="flex items-start gap-4">
              <Avatar src={m.user.avatar} name={m.user.name} size={64} ring className="-mt-10 shadow-[var(--shadow-soft)]" />
              <div className="min-w-0 flex-1">
                <h1 className="text-[21px] font-bold leading-tight">
                  <span className="break-words">{m.user.name}</span>{" "}
                  {verified && <VerifiedBadge />}
                </h1>
                <p className="text-[15px] text-muted">{m.specialty}</p>
              </div>
              <ContactButtons masterId={m.id} phone={m.publicPhone} isSelf={isSelf} />
            </div>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <p>
                <span className="text-2xl font-extrabold">{money(m.hourlyRate)}</span>
                <span className="text-muted"> / soat</span>
                <span className="block text-sm text-muted">Xizmatlar {money(m.priceFrom)} dan</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {verified ? (
                  <Badge tone="brand">
                    <ShieldCheck className="h-3.5 w-3.5" /> Tasdiqlangan usta
                  </Badge>
                ) : (
                  <Badge>Tasdiqlanmagan</Badge>
                )}
                {m.isAvailable ? <Badge tone="success">● Hozir ishlayapti</Badge> : <Badge>Band</Badge>}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-brand-500">
                  <Clock className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block font-semibold">
                    {m.workStart} – {m.workEnd}
                  </span>
                  <span className={openNow ? "text-success" : "text-muted"}>
                    {workDaysLabel(m.workDays)} · {openNow ? "Ochiq" : "Yopiq"}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cream text-brand-500">
                  <MapPin className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{m.district}</span>
                  <span className="block truncate text-muted">{m.region}</span>
                </span>
              </div>
            </div>
            {isSelf && (
              <ButtonLink href="/usta/profil" variant="outline" size="sm" className="mt-4" icon={<Pencil className="h-4 w-4" />}>
                Profilni tahrirlash
              </ButtonLink>
            )}
          </section>

          {/* Shu yo‘nalishdagi boshqa ustalar */}
          {similar.length > 0 && (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="section-title">{m.category.name} ustalari</h2>
                <Link href={`/kategoriyalar/${m.category.slug}`} className="text-sm font-semibold text-muted hover:text-brand-600">
                  Barchasi
                </Link>
              </div>
              <Scroller>
                {similar.map((s) => (
                  <MasterPill key={s.id} m={s} />
                ))}
              </Scroller>
            </section>
          )}

          <nav className="no-scrollbar sticky top-0 z-30 -mx-4 flex gap-2 overflow-x-auto bg-cream/90 px-4 py-2.5 backdrop-blur lg:top-[72px] lg:mx-0 lg:px-0" aria-label="Profil bo‘limlari">
            {sections.map(([anchor, label]) => (
              <a key={anchor} href={`#${anchor}`} className="chip shrink-0 hover:text-brand-600">
                {label}
              </a>
            ))}
          </nav>

          <section id="haqida" className="scroll-mt-20">
            <h2 className="section-title mb-3">Usta haqida</h2>
            <div className="card p-5">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{m.bio || "Usta hali o‘zi haqida ma’lumot qo‘shmagan."}</p>
              <p className="mt-3 text-sm text-muted">UstaTop’da {dateLong(m.createdAt)} dan beri</p>
            </div>
          </section>

          <section id="xizmatlar" className="scroll-mt-20">
            <h2 className="section-title mb-3">Xizmatlar va narxlar</h2>
            {m.services.length ? (
              <ServiceSelector
                masterId={m.id}
                services={m.services}
                fallbackImage={m.category.image}
                preselected={xizmat}
                favorite={favs.has(m.id)}
                isSelf={isSelf}
              />
            ) : (
              <EmptyState title="Xizmatlar hali qo‘shilmagan" description="Usta bilan xabar orqali bog‘lanib, narxni kelishib olishingiz mumkin." />
            )}
          </section>

          <section id="portfolio" className="scroll-mt-20">
            <h2 className="section-title mb-3">Ish namunalari</h2>
            {m.portfolio.length ? <PortfolioGallery items={m.portfolio} /> : <EmptyState title="Portfolio bo‘sh" description="Usta hali ish namunalarini yuklamagan." />}
          </section>

          <section id="sharhlar" className="scroll-mt-20">
            <h2 className="section-title mb-3">Mijozlar sharhlari</h2>
            {m.reviews.length ? (
              <div className="space-y-3">
                <div className="card flex items-center gap-6 p-5">
                  <div className="text-center">
                    <p className="text-4xl font-extrabold">{m.rating.toFixed(1)}</p>
                    <Stars value={m.rating} />
                    <p className="mt-1 text-xs text-muted">{m.reviewCount} ta sharh</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const c = ratingDist.find((x) => x.rating === r)?._count._all ?? 0;
                      return (
                        <div key={r} className="flex items-center gap-2 text-xs">
                          <span className="w-3 font-semibold">{r}</span>
                          <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-2">
                            <span className="block h-full rounded-full bg-amber-400" style={{ width: `${m.reviewCount ? (c / m.reviewCount) * 100 : 0}%` }} />
                          </span>
                          <span className="w-5 text-right text-muted">{c}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {m.reviews.map((r) => (
                  <article key={r.id} className="card p-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={r.client.avatar} name={r.client.name} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{r.client.name}</p>
                        <p className="text-xs text-muted">{timeAgo(r.createdAt)}</p>
                      </div>
                      <Stars value={r.rating} size={14} />
                    </div>
                    <p className="mt-2.5 text-[15px] leading-relaxed text-ink-2">{r.comment}</p>
                    {r.reply && (
                      <div className="mt-3 rounded-2xl bg-cream p-3 text-sm">
                        <p className="mb-0.5 font-semibold">Usta javobi</p>
                        <p className="text-ink-2">{r.reply}</p>
                      </div>
                    )}
                    {user && user.id !== r.client.id && !isSelf && <ComplaintButton reviewId={r.id} label="Shikoyat" className="mt-2 text-xs" />}
                    {isSelf && <ComplaintButton reviewId={r.id} label="Sharh ustidan shikoyat" className="mt-2 text-xs" />}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Star className="h-7 w-7" />} title="Hali sharhlar yo‘q" description="Birinchi bo‘lib buyurtma bering va baho qoldiring." />
            )}
          </section>

          <section id="joylashuv" className="scroll-mt-20">
            <h2 className="section-title mb-3">Joylashuv</h2>
            <div className="card overflow-hidden">
              <iframe title="Ustaning joylashuvi" src={mapSrc} className="h-56 w-full border-0" loading="lazy" referrerPolicy="no-referrer" />
              <div className="flex items-center justify-between gap-3 p-4">
                <p className="text-sm">
                  <span className="font-semibold">{m.address || `${m.district}, ${m.region}`}</span>
                  <span className="block text-muted">Xizmat hududi: {m.region}</span>
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600"
                >
                  Xaritada <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>

          <section id="aloqa" className="scroll-mt-20">
            <h2 className="section-title mb-3">Aloqa ma’lumotlari</h2>
            <div className="card divide-y divide-line">
              {m.publicPhone && (
                <a href={`tel:${m.publicPhone}`} className="flex items-center gap-3 p-4 transition hover:bg-cream/60">
                  <Phone className="h-5 w-5 text-brand-500" />
                  <span className="flex-1 font-semibold">{fmtPhone(m.publicPhone)}</span>
                  <span className="text-sm text-muted">Qo‘ng‘iroq</span>
                </a>
              )}
              {m.telegram && (
                <a href={`https://t.me/${m.telegram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 transition hover:bg-cream/60">
                  <Send className="h-5 w-5 text-brand-500" />
                  <span className="flex-1 font-semibold">@{m.telegram}</span>
                  <span className="text-sm text-muted">Telegram</span>
                </a>
              )}
              <div className="flex items-center gap-3 p-4">
                <CalendarClock className="h-5 w-5 text-brand-500" />
                <span className="flex-1">
                  <span className="font-semibold">Ish vaqti: </span>
                  {workDaysLabel(m.workDays)}, {m.workStart}–{m.workEnd}
                </span>
              </div>
              {!isSelf && (
                <div className="p-4">
                  <ComplaintButton targetUserId={m.userId} label="Usta ustidan shikoyat qilish" />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Kompyuter: yon karta */}
        <aside className="hidden lg:block">
          <div className="card sticky top-24 space-y-4 p-6">
            <div className="flex items-center gap-3">
              <Avatar src={m.user.avatar} name={m.user.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 font-bold">
                  <span className="truncate">{m.user.name}</span> {verified && <VerifiedBadge />}
                </p>
                <Rating value={m.rating} count={m.reviewCount} />
              </div>
              {!isSelf && <FavoriteButton masterId={m.id} initial={favs.has(m.id)} />}
            </div>
            <p className="text-sm text-muted">Xizmatlar ro‘yxatidan keraklilarini belgilang va buyurtma bering. To‘lov — Click, Payme, Uzcard, Humo yoki naqd.</p>
            <ButtonLink href="#xizmatlar" className="w-full" size="lg">
              Xizmat tanlash
            </ButtonLink>
            <div className="flex justify-center">
              <ContactButtons masterId={m.id} phone={m.publicPhone} isSelf={isSelf} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
