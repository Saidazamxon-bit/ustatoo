export type ChangelogEntry = {
  version: string;
  date: string; // YYYY-MM-DD
  title: string;
  features: string[];
  design: string[];
  fixes: string[];
};

/** Yangilanishlar tarixi — eng yangisi birinchi */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.3.1",
    date: "2026-11-22",
    title: "Android ilovasi — to‘g‘ridan-to‘g‘ri saytdan",
    features: [
      "Android telefonlarda “Yuklab olish” taklifi: ilova Play Market’siz, saytdan o‘rnatiladi",
      "4 qadamli o‘rnatish yo‘riqnomasi, kompyuterda QR kod va qisqa havola (/android)",
      "Android ilovasi ichida o‘rnatish takliflari ko‘rsatilmaydi",
    ],
    design: [],
    fixes: ["Android ilovasi Chrome o‘rnatilmagan telefonlarda ham ochiladi (internet ruxsati qo‘shildi)"],
  },
  {
    version: "1.3.0",
    date: "2026-11-22",
    title: "Android ilovasi",
    features: [
      "UstaTop Android ilovasi (APK) — to‘liq ekranli, brauzer panelisiz",
      "Ikonkani uzoq bosganda tezkor havolalar: qidiruv, buyurtmalar, xabarlar",
      "Saytdagi havolalar o‘rnatilgan ilovada ochiladi (App Links)",
      "Profil sozlamalarida hisobni butunlay o‘chirish imkoniyati",
      "Maxfiylik siyosati sahifasi",
    ],
    design: ["Android adaptiv va mavzuli (Android 13+) ikonkalar, Android 12+ ochilish ekrani"],
    fixes: [],
  },
  {
    version: "1.2.0",
    date: "2026-11-22",
    title: "Tungi rejim",
    features: [
      "Tungi va kunduzgi ko‘rinish: “Tizim” tanlansa, qurilma sozlamasiga qarab avtomatik almashadi",
      "Mavzuni bosh sahifa, profil va sozlamalardan bir bosishda almashtirish",
    ],
    design: [
      "Barcha sahifalar uchun ko‘zni charchatmaydigan to‘q, iliq palitra",
      "Mavzu almashganda ranglarning yumshoq o‘tishi, ilova paneli rangi ham moslashadi",
    ],
    fixes: [
      "Barcha sana va vaqtlar O‘zbekiston vaqtida (UTC+5) to‘g‘ri ko‘rsatiladi — avval server vaqti (UTC) chiqib qolardi",
      "“Hozir ochiq/yopiq” va usta ish jadvali Toshkent vaqti bo‘yicha hisoblanadi",
      "Oflayn sahifa ham tanlangan mavzuda ko‘rinadi",
      "Kompyuter sarlavhasi kichikroq ekranlarda sig‘may qolmaydi",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-11-22",
    title: "UstaTop endi telefoningizga o‘rnatiladi",
    features: [
      "Ilovani bosh ekranga o‘rnatish (Android, iPhone va iPad)",
      "Avtomatik yangilanish va “Yangilanishlar markazi”",
      "Internet uzilganda oflayn rejim: ochilgan sahifalar keshdan ishlaydi",
      "Chat va buyurtma formasidagi yozuvlar qoralama sifatida saqlanadi",
      "“UstaTop ilovasi” sahifasi",
    ],
    design: [
      "Ilova ikonkasi va iOS ochilish ekranlari (splash)",
      "Internet holati va yangilanish uchun animatsion bildirishnomalar",
    ],
    fixes: ["Ovozli qidiruv uchun mikrofon ruxsati tuzatildi"],
  },
  {
    version: "1.0.0",
    date: "2026-11-22",
    title: "UstaTop ishga tushdi",
    features: [
      "Ustalarni qidirish, filtrlash va saralash",
      "Usta profili, xizmatlar, portfolio va sharhlar",
      "5 bosqichli buyurtma berish va holatlarni kuzatish",
      "Click, Payme, Uzcard, Humo va naqd to‘lov (demo)",
      "Real vaqtdagi chat va bildirishnomalar",
      "Mijoz, usta va administrator kabinetlari",
    ],
    design: ["Premium cream + to‘q sariq dizayn, mobil uchun pastki navigatsiya"],
    fixes: [],
  },
];
