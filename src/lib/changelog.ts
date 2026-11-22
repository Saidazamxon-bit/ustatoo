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
