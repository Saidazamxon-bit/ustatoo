# UstaTop — professional ustalar marketplace platformasi

Mijozlar kerakli ustani topadi, narxlarni solishtiradi, onlayn buyurtma beradi, to‘laydi va usta bilan real vaqtda yozishadi. Ustalar profil yaratadi, xizmat va narxlarni joylaydi, buyurtmalarni boshqaradi va daromadini kuzatadi. Administrator ustalarni tasdiqlaydi va platformani boshqaradi.

## Tez ishga tushirish

```bash
npm install
cp .env.example .env          # AUTH_SECRET ni o‘zgartiring
npm run setup                 # prisma generate + db push + demo ma'lumotlar
npm run dev                   # http://localhost:3000
```

Production: `npm run build && npm start`.

### Demo hisoblar

| Rol   | Telefon            | Parol    |
|-------|--------------------|----------|
| Mijoz | +998 90 123 45 67  | demo123  |
| Usta  | +998 91 234 56 78  | demo123  |
| Admin | +998 99 000 00 00  | admin123 |

Kirish sahifasida bitta bosish bilan kirish tugmalari ham bor. Demo ma'lumotlarni qayta tiklash: `npm run db:reset`.

## Texnologiyalar

- **Next.js 15** (App Router, Server Components, Route Handlers) + **React 19** + **TypeScript**
- **Prisma** ORM — dev uchun SQLite, PostgreSQL ga o‘tishga tayyor
- **Tailwind CSS 4** — dizayn tokenlari `src/app/globals.css` da
- **JWT** sessiyalar (`jose`, httpOnly cookie) + **bcrypt** parollar
- **Zod** — server va mijoz uchun umumiy validatsiya (`src/lib/validators.ts`)
- **Server-Sent Events** — xabarlar, bildirishnomalar va buyurtma holatlari real vaqtda
- **lucide-react** ikonkalar, **Urbanist** shrifti

## Arxitektura

```
src/
  app/
    (main)/            Mijoz va usta sahifalari (pastki navigatsiya bilan)
      page.tsx           Bosh sahifa
      kategoriyalar/     Kategoriyalar va kategoriya sahifasi (SEO)
      qidiruv/           Qidiruv, filtrlar, saralash
      ustalar/[id]/      Usta profili (SEO + JSON-LD)
      buyurtma/yangi/    5 bosqichli buyurtma berish
      buyurtmalar/       Buyurtmalar ro‘yxati va tafsiloti (holatlar, amallar)
      tolov/             To‘lov sahifasi va demo to‘lov oynasi
      xabarlar/          Suhbatlar va chat
      profil/            Mijoz kabineti
      usta/              Usta kabineti (panel, profil, xizmatlar, portfolio, jadval, daromad, sharhlar)
    (auth)/            Kirish va ro‘yxatdan o‘tish
    admin/             Administrator paneli
    api/               REST API (route handlers)
  components/          Qayta ishlatiladigan UI (ui/, layout/, masters/, orders/, chat/, search/ ...)
  lib/                 Umumiy kod: konstantalar, formatlash, hududlar, validatsiya, API klient
  server/              Faqat serverda: db, auth, xatoliklar, servislar, to‘lovlar, storage, realtime
prisma/                Sxema va demo ma'lumotlar (seed)
```

**Qatlamlar:** sahifalar ma'lumotni `src/server/services/*` orqali oladi; o‘zgartirishlar `/api/*` orqali bo‘ladi. Har bir API `route()` o‘rovchisidan o‘tadi: yagona JSON xato formati (`{ error: { message, fields } }`), Zod xatolari → 422, CSRF uchun Origin tekshiruvi.

### Buyurtma holatlari

`Yangi → Kutilmoqda (usta ko‘rdi) → Qabul qilindi → Jarayonda → Yakunlandi`, istalgan bosqichda `Bekor qilindi`. O‘tish qoidalari `src/server/services/orders.ts` dagi `RULES` jadvalida; holat optimistik bloklash bilan yangilanadi, har bir o‘zgarish tarixga yoziladi va ikkala tomonga real vaqtda yuboriladi.

### To‘lovlar

`src/server/payments/` — `PaymentProvider` interfeysi. Hozir **demo rejim**: Click, Payme, Uzcard, Humo uchun provayder sahifasini simulyatsiya qiluvchi oyna (karta/telefon → SMS kod `123456` → tasdiqlash), naqd pul esa ish yakunida usta tomonidan belgilanadi. Haqiqiy integratsiya uchun:

1. `.env`: `PAYMENTS_MODE=live`, `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`, `PAYME_MERCHANT_ID`, `PAYME_SECRET_KEY`
2. Admin → Sozlamalar → “To‘lovlar demo rejimida” ni o‘chiring
3. `click.ts` / `payme.ts` checkout URL larini quradi; provayder callback’lari (Click Prepare/Complete, Payme Merchant API) uchun `/api/payments/<provider>/callback` route qo‘shiladi va `confirmDemoPayment` dagi holat yangilash mantig‘i qayta ishlatiladi.

### Real vaqt

`/api/stream` (SSE) har bir foydalanuvchiga xabarlar, o‘qilganlik, bildirishnomalar va buyurtma holatlarini yuboradi. Hodisalar shinasi (`src/server/events.ts`) bitta server uchun xotirada; bir nechta instance uchun uni Redis Pub/Sub bilan almashtirish kifoya (interfeys o‘zgarmaydi).

### Rasmlar

Yuklangan fayllar `storage/uploads` ga saqlanadi va `/api/files/*` orqali beriladi. Fayl turi “magic bytes” bo‘yicha tekshiriladi (JPG/PNG/WEBP, ≤ 5 MB). S3 kabi xizmatga o‘tish uchun `src/server/storage.ts` dagi `StorageDriver` ni amalga oshiring.

## Xavfsizlik

- httpOnly + SameSite=Lax cookie, JWT HS256, bloklangan foydalanuvchi sessiyasi bekor
- Rol tekshiruvi: middleware (kirish), sahifa va API darajasida (rol/egalik)
- Origin tekshiruvi (CSRF), login/ro‘yxat/xabar/yuklash uchun rate limit
- Barcha kiritishlar Zod bilan tekshiriladi; xatolar o‘zbek tilida
- Path traversal himoyasi, xavfsizlik sarlavhalari (`next.config.ts`)

## PostgreSQL ga o‘tish

`prisma/schema.prisma` da `provider = "postgresql"`, `.env` da `DATABASE_URL=postgresql://...`, so‘ng `npx prisma db push && npm run db:seed`.

## Rasm manbalari

`public/img/` dagi rasmlar: `covers/gen-*.jpg` va `categories/{elektrik,quruvchi,tom-yopish}.jpg` — AI yordamida yaratilgan; qolganlari [Unsplash](https://unsplash.com/license) litsenziyasi ostidagi fotosuratlar. Admin paneli orqali kategoriya rasmlarini, ustalar esa o‘z cover/avatar/portfolio rasmlarini almashtirishi mumkin.
