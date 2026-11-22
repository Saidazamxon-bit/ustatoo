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
