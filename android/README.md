# UstaTop — Android ilovasi (TWA)

Bu loyiha UstaTop PWA’sini **Trusted Web Activity** sifatida Google Play’ga chiqaradi.
Ilova ichida `https://ustatop-tau.vercel.app` Chrome dvigateli orqali to‘liq ekranda ochiladi:
saytga chiqarilgan har bir yangilanish ilovada ham darhol paydo bo‘ladi — Play’ga qayta yuklash
faqat ikonka, nom, domen yoki Android sozlamalari o‘zgarganda kerak.

| | |
|---|---|
| Paket nomi | `uz.ustatop.app` |
| Versiya | `1.3.0` (versionCode `2`) |
| minSdk / targetSdk | 24 (Android 7.0) / 36 |
| Ochiladigan manzil | `/?source=twa` |
| Domen tasdig‘i | `/.well-known/assetlinks.json` (`src/app/.well-known/assetlinks.json/route.ts`) |

## Yig‘ish

Kerak: JDK 17+ (21 tavsiya), Android SDK (platform 36, build-tools 36).

```bash
cd android
echo "sdk.dir=/path/to/android-sdk" > local.properties
cp keystore.properties.example keystore.properties   # parol va yo‘llarni to‘ldiring
./gradlew bundleRelease     # Google Play uchun: app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease   # To‘g‘ridan-to‘g‘ri o‘rnatish uchun: app/build/outputs/apk/release/app-release.apk
```

Imzolash ma’lumotlari `keystore.properties` yoki muhit o‘zgaruvchilaridan olinadi:
`USTATOP_KEYSTORE`, `USTATOP_KEYSTORE_PASSWORD`, `USTATOP_KEY_ALIAS`, `USTATOP_KEY_PASSWORD`.

> ⚠️ **Upload kalitini (`.jks`) va parollarni yo‘qotmang va gitga qo‘shmang.** Ular `.gitignore`da.
> Kalit yo‘qolsa, Play Console orqali upload kalitini almashtirish so‘rovini yuborish kerak bo‘ladi.

Yangi APK’ni saytdagi “Android ilovasini yuklab olish” tugmasi uchun nusxalang:

```bash
cp app/build/outputs/apk/release/app-release.apk ../public/downloads/ustatop-android.apk
```

va `src/lib/android.ts` dagi `versionName`, `versionCode`, `sizeMb` qiymatlarini yangilang.

## Google Play’ga chiqarish

1. [Play Console](https://play.google.com/console) da dasturchi hisobini oching (bir martalik $25).
2. **Ilova yaratish** → nomi “UstaTop”, tili o‘zbekcha, turi “Ilova”, bepul.
3. **Release → Production (yoki avval Internal testing) → Create release** → `app-release.aab` ni yuklang.
   Play App Signing’ni yoqing (standart).
4. **Muhim — domen tasdig‘i:** *Setup → App signing* sahifasidagi **App signing key certificate**
   SHA-256 barmoq izini nusxalang va Vercel loyihasida muhit o‘zgaruvchisiga qo‘shing:
   ```
   ANDROID_SHA256_FINGERPRINTS=AA:BB:...:FF
   ```
   (bir nechtasini vergul bilan ajratish mumkin), so‘ng saytni qayta deploy qiling.
   Buni qilmasangiz, Play’dan o‘rnatilgan ilova tepasida brauzer manzil satri ko‘rinib qoladi.
   Tekshirish: `https://ustatop-tau.vercel.app/.well-known/assetlinks.json`.
5. **Store listing** (`android/store/`):
   - Ikonka: `store/play-icon-512.png`
   - Feature graphic: `store/feature-graphic-1024x500.png`
   - Telefon skrinshotlari: `store/screenshots/*.png` (1080×1920)
   - Qisqa tavsif (80 belgi): *Ishonchli ustalarni toping, onlayn buyurtma bering va to‘lang.*
6. **App content**:
   - Privacy policy: `https://ustatop-tau.vercel.app/maxfiylik`
   - Account deletion URL: `https://ustatop-tau.vercel.app/hisobni-ochirish`
     (ilova ichida: Profil → Sozlamalar → Hisobni o‘chirish)
   - Ads: yo‘q. Target audience: 18+. Content rating anketasini to‘ldiring.
   - Data safety — yig‘iladigan ma’lumotlar: ism, telefon, email (ixtiyoriy), manzil, rasmlar,
     ilova ichidagi xabarlar, xaridlar tarixi. Hammasi HTTPS orqali shifrlanadi, uchinchi
     shaxslarga sotilmaydi, foydalanuvchi o‘chirishni so‘rashi mumkin.
     Taxminiy joylashuv faqat qurilmada ishlatiladi (serverga yuborilmaydi).
   - Yangi shaxsiy dasturchi hisoblari uchun Play production’dan oldin 12+ testchi bilan
     14 kunlik yopiq test talab qilishi mumkin.

## Yangi versiya chiqarish

1. `app/build.gradle` da `versionCode` ni **oshiring** (har bir yuklash uchun yangi butun son) va `versionName` ni yangilang.
2. `./gradlew bundleRelease assembleRelease`
3. AAB’ni Play’ga yuklang, APK’ni `public/downloads/` ga nusxalang, `src/lib/android.ts` ni yangilang.

## Domen o‘zgarsa

`app/build.gradle` dagi `twa.hostName` ni yangi domenga almashtiring, yangi domenda ham
`/.well-known/assetlinks.json` ishlashini tekshiring va yangi versiya chiqaring.

## Ikonka va grafikalar

`node scripts/generate-android-assets.mjs` — launcher ikonkalari, splash va Play grafikalarini qayta yaratadi.
