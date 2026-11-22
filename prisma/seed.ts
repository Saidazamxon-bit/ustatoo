/* eslint-disable no-console */
// Demo ma'lumotlar: kategoriyalar, ustalar, xizmatlar, portfolio, sharhlar,
// buyurtmalar, suhbatlar, bildirishnomalar va shikoyatlar.
// Ishga tushirish: npm run db:seed  (yoki to‘liq qayta yaratish: npm run db:reset)
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { normalizeSearch } from "../src/lib/text";
import { locate } from "../src/lib/regions";
import { DEFAULT_SETTINGS } from "../src/lib/constants";

const db = new PrismaClient();

const CATEGORIES = [
  { slug: "elektrik", name: "Elektrik", icon: "zap", description: "Elektr montaj, rozetka, yoritish va shchit ishlari" },
  { slug: "santexnik", name: "Santexnik", icon: "droplets", description: "Quvur, kran, unitaz va isitish tizimlari" },
  { slug: "konditsioner", name: "Konditsioner ustasi", icon: "snowflake", description: "O‘rnatish, tozalash va freon to‘ldirish" },
  { slug: "mebel", name: "Mebel ustasi", icon: "armchair", description: "Mebel yasash, yig‘ish va ta’mirlash" },
  { slug: "quruvchi", name: "Quruvchi", icon: "hard-hat", description: "Uy qurish, devor terish va kapital ta’mir" },
  { slug: "beton", name: "Beton ustasi", icon: "boxes", description: "Poydevor, styajka va beton quyish" },
  { slug: "tom-yopish", name: "Tom yopish", icon: "home", description: "Tom yopish, ta’mirlash va tarnov" },
  { slug: "payvandchi", name: "Payvandchi", icon: "flame", description: "Darvoza, panjara va metall konstruksiya" },
  { slug: "boyoqchi", name: "Bo‘yoqchi", icon: "paint-roller", description: "Devor, shift va dekorativ bo‘yash" },
  { slug: "suvoqchi", name: "Suvoqchi", icon: "layers", description: "Suvoq, shpaklyovka va gipsokarton" },
  { slug: "kafel", name: "Kafel ustasi", icon: "grid-3x3", description: "Kafel, metlax va mozaika yotqizish" },
  { slug: "eshik-deraza", name: "Eshik va deraza ustasi", icon: "door-open", description: "Plastik deraza, eshik va qulflar" },
  { slug: "maishiy-texnika", name: "Maishiy texnika ta’mirlash", icon: "washing-machine", description: "Kir yuvish mashinasi, muzlatkich, plita" },
  { slug: "avto", name: "Avtomobil ustasi", icon: "car", description: "Diagnostika, moy almashtirish va xodovoy" },
  { slug: "boshqa", name: "Boshqa xizmatlar", icon: "wrench", description: "Mayda maishiy ishlar va universal usta" },
];

type Svc = [title: string, price: number, unit: string, duration: string, description: string];

const SERVICES: Record<string, Svc[]> = {
  elektrik: [
    ["Rozetka va vklyuchatel o‘rnatish", 50000, "UNIT", "20-30 daqiqa", "Yangi rozetka yoki vklyuchatel o‘rnatish, eskisini almashtirish."],
    ["Lyustra va chiroq o‘rnatish", 90000, "UNIT", "30-60 daqiqa", "Lyustra, spot va LED chiroqlarni xavfsiz o‘rnatish."],
    ["Elektr simlarini almashtirish", 120000, "HOUR", "1 kundan", "Eski alyumin simlarni mis simga almashtirish, yashirin montaj."],
    ["Avtomat shchit yig‘ish", 450000, "FIXED", "3-4 soat", "Kvartira shchitini avtomat va UZO bilan to‘liq yig‘ish."],
    ["Elektr nosozligini aniqlash", 100000, "FIXED", "1 soat", "Qisqa tutashuv, tok urishi va o‘chib qolish sababini topish."],
  ],
  santexnik: [
    ["Smesitel va kran almashtirish", 80000, "UNIT", "30-60 daqiqa", "Oshxona va hammom smesitellarini o‘rnatish."],
    ["Unitaz o‘rnatish", 250000, "FIXED", "2-3 soat", "Unitaz, installyatsiya va bachok o‘rnatish."],
    ["Quvurlarni tozalash", 150000, "FIXED", "1-2 soat", "Tiqilib qolgan kanalizatsiyani maxsus uskunada tozalash."],
    ["Suv isitgich o‘rnatish", 300000, "FIXED", "2-3 soat", "Bak va oqimli suv isitgichlarni ulash."],
    ["Polipropilen quvur yotqizish", 60000, "METER", "1 kundan", "Issiq va sovuq suv quvurlarini almashtirish."],
  ],
  konditsioner: [
    ["Konditsioner o‘rnatish", 450000, "FIXED", "2-4 soat", "7-24 BTU split tizimlarni kafolat bilan o‘rnatish."],
    ["Konditsionerni tozalash", 150000, "FIXED", "1 soat", "Ichki va tashqi blokni antibakterial tozalash."],
    ["Freon to‘ldirish", 250000, "FIXED", "1 soat", "Germetiklikni tekshirish va freon to‘ldirish."],
    ["Konditsionerni yechib olish", 200000, "FIXED", "1-2 soat", "Ko‘chish uchun freonni saqlagan holda yechish."],
  ],
  mebel: [
    ["Oshxona mebeli yasash", 3500000, "FIXED", "7-14 kun", "O‘lchov olish, dizayn va LDSP/MDF dan oshxona yasash."],
    ["Shkaf-kupe yasash", 2800000, "FIXED", "7-10 kun", "Buyurtma asosida shkaf-kupe, ko‘zgu va ichki to‘ldirish."],
    ["Mebel yig‘ish", 200000, "FIXED", "2-4 soat", "Do‘kondan olingan mebelni yig‘ish va o‘rnatish."],
    ["Mebel ta’mirlash", 150000, "HOUR", "1-3 soat", "Eshik, petlya, tortma va qoplamani tiklash."],
  ],
  quruvchi: [
    ["G‘isht terish", 90000, "M2", "kelishiladi", "Devor va to‘siqlarni g‘isht yoki blokdan terish."],
    ["Kapital ta’mir", 350000, "M2", "30 kundan", "Kvartirani “kalit topshirish” holatigacha ta’mirlash."],
    ["Devorni buzish", 70000, "M2", "1-2 kun", "Ichki devor va to‘siqlarni xavfsiz buzish, chiqindini olib ketish."],
    ["Pardevor (gazoblok) qurish", 80000, "M2", "1-3 kun", "Gazoblok yoki penoblokdan ichki devor qurish."],
  ],
  beton: [
    ["Beton quyish", 180000, "M3", "1 kun", "Beton tayyorlash va quyish, vibratsiya bilan zichlash."],
    ["Pol styajkasi", 60000, "M2", "1-2 kun", "Mayoq bo‘yicha tekis pol styajkasi."],
    ["Poydevor quyish", 250000, "M3", "2-5 kun", "Lenta va plita poydevor, armatura bilan."],
  ],
  "tom-yopish": [
    ["Metallocherepitsa yopish", 75000, "M2", "2-5 kun", "Metallocherepitsa va profnastil bilan tom yopish."],
    ["Tom ta’mirlash", 400000, "FIXED", "1 kun", "Oqayotgan tomni aniqlash va germetiklash."],
    ["Tarnov o‘rnatish", 45000, "METER", "1 kun", "Plastik yoki metall tarnov tizimini o‘rnatish."],
  ],
  payvandchi: [
    ["Darvoza yasash", 2500000, "FIXED", "5-7 kun", "Ko‘cha darvozasi, kalitka va avtomatika uchun tayyorlash."],
    ["Panjara yasash", 350000, "M2", "3-5 kun", "Deraza va balkon panjaralari, dekorativ elementlar bilan."],
    ["Payvandlash ishlari", 120000, "HOUR", "kelishiladi", "Joyida payvandlash, metall konstruksiyalarni ta’mirlash."],
  ],
  boyoqchi: [
    ["Devor bo‘yash", 25000, "M2", "1-3 kun", "Grunt va 2 qavat sifatli bo‘yoq bilan bo‘yash."],
    ["Shift bo‘yash", 30000, "M2", "1-2 kun", "Shiftni tekis va dog‘siz bo‘yash."],
    ["Dekorativ bo‘yoq", 90000, "M2", "2-4 kun", "Venetsiya, barxat va boshqa dekorativ qoplamalar."],
  ],
  suvoqchi: [
    ["Devor suvog‘i", 45000, "M2", "2-5 kun", "Mayoq bo‘yicha gips yoki sement suvoq."],
    ["Shpaklyovka", 35000, "M2", "2-3 kun", "Bo‘yoq yoki oboy ostiga ikki qavat shpaklyovka."],
    ["Gipsokarton ishlari", 80000, "M2", "2-5 kun", "Gipsokarton shift va devorlar, ko‘p bosqichli shift."],
  ],
  kafel: [
    ["Kafel yotqizish", 90000, "M2", "2-5 kun", "Devor va polga kafel, ideal choklar bilan."],
    ["Mozaika yotqizish", 150000, "M2", "2-4 kun", "Hammom va oshxona uchun mozaika."],
    ["Hammomni to‘liq ta’mirlash", 4000000, "FIXED", "10-14 kun", "Kafel, santexnika va gidroizolyatsiya bilan to‘liq ta’mir."],
  ],
  "eshik-deraza": [
    ["Plastik deraza o‘rnatish", 350000, "UNIT", "2-3 soat", "Plastik derazani o‘rnatish, otkos va podokonnik."],
    ["Eshik o‘rnatish", 400000, "UNIT", "3-4 soat", "Ichki va kirish eshiklarini o‘rnatish."],
    ["Qulf almashtirish", 120000, "FIXED", "1 soat", "Eshik qulfi va silindrini almashtirish."],
    ["Deraza rostlash", 80000, "UNIT", "30 daqiqa", "Qishki/yozgi rejimga o‘tkazish, rezina almashtirish."],
  ],
  "maishiy-texnika": [
    ["Kir yuvish mashinasi ta’miri", 200000, "FIXED", "1-2 soat", "Nasos, TEN, podshipnik va elektronikani ta’mirlash."],
    ["Muzlatkich ta’miri", 250000, "FIXED", "1-3 soat", "Freon, kompressor va termostat nosozliklari."],
    ["Gaz plita ta’miri", 150000, "FIXED", "1 soat", "Konforka, duxovka va gaz-kontrolni tuzatish."],
    ["Texnika diagnostikasi", 80000, "FIXED", "30-60 daqiqa", "Nosozlikni aniqlash, ta’mir qilinsa bepul."],
  ],
  avto: [
    ["Kompyuter diagnostika", 150000, "FIXED", "1 soat", "Barcha tizimlarni skaner orqali tekshirish."],
    ["Moy almashtirish", 120000, "FIXED", "30-40 daqiqa", "Motor moyi va filtrlarni almashtirish."],
    ["Tormoz kolodkasi almashtirish", 180000, "FIXED", "1 soat", "Old yoki orqa kolodkalarni almashtirish."],
    ["Xodovoy ta’miri", 300000, "FIXED", "2-4 soat", "Amortizator, sharovoy va rulevoy tyagalar."],
  ],
  boshqa: [
    ["Mayda maishiy ishlar", 100000, "HOUR", "1 soatdan", "Javon osish, karniz, rasm va boshqa mayda ishlar."],
    ["Mebel va texnika ko‘chirish", 150000, "HOUR", "kelishiladi", "Uy ichida va ko‘chishda yuk tashishga yordam."],
    ["Televizor osish", 120000, "UNIT", "1 soat", "Kronshteyn bilan devorga televizor o‘rnatish."],
  ],
};

type M = {
  name: string;
  phone: string;
  cat: string;
  specialty: string;
  avatar?: string;
  cover: string;
  exp: number;
  rate: number;
  region: string;
  district: string;
  verified: "APPROVED" | "PENDING" | "NONE";
  available: boolean;
  bio: string;
  telegram?: string;
  daysAgo: number;
  hours?: [string, string];
};

const T = "Toshkent shahri";
const MASTERS: M[] = [
  { name: "Sardor Rahimov", phone: "+998912345678", cat: "elektrik", specialty: "Elektrik montajchi", avatar: "/img/avatars/m1.jpg", cover: "/img/covers/gen-electrician.jpg", exp: 12, rate: 120000, region: T, district: "Yunusobod", verified: "APPROVED", available: true, telegram: "sardor_elektrik", daysAgo: 400, bio: "12 yillik tajribaga ega elektrik montajchiman. Kvartira va xususiy uylarda elektr tarmog‘ini noldan yig‘aman, eski simlarni almashtiraman, avtomat shchitlar yig‘aman. Barcha ishlarga 1 yil kafolat beraman. O‘z asbob-uskunalarim bilan kelaman, ishdan keyin tozalab ketaman." },
  { name: "Jasur Toshmatov", phone: "+998901110002", cat: "elektrik", specialty: "Elektrik", avatar: "/img/avatars/m2.jpg", cover: "/img/covers/electrician-2.jpg", exp: 6, rate: 90000, region: T, district: "Chilonzor", verified: "APPROVED", available: true, daysAgo: 200, bio: "Rozetka, lyustra, spot chiroqlar va elektr nosozliklarini tez va sifatli bartaraf etaman. Chilonzor va atrof tumanlarga 1 soat ichida yetib boraman." },
  { name: "Bekzod Aliyev", phone: "+998901110003", cat: "santexnik", specialty: "Santexnik", avatar: "/img/avatars/m3.jpg", cover: "/img/covers/plumber.jpg", exp: 9, rate: 100000, region: T, district: "Mirzo Ulug‘bek", verified: "APPROVED", available: true, daysAgo: 350, bio: "Santexnika bo‘yicha barcha ishlar: quvur almashtirish, unitaz va vanna o‘rnatish, kanalizatsiya tozalash. Sifatli materiallar bilan ishlayman, narxlar oldindan kelishiladi." },
  { name: "Otabek Yusupov", phone: "+998901110004", cat: "santexnik", specialty: "Santexnik-isitish tizimlari", avatar: "/img/avatars/m4.jpg", cover: "/img/covers/plumber-2.jpg", exp: 15, rate: 130000, region: T, district: "Yakkasaroy", verified: "APPROVED", available: false, daysAgo: 500, bio: "Isitish tizimlari, kotyol va issiq pol bo‘yicha mutaxassis. 15 yildan beri xususiy uylar va ofislarda ishlayman." },
  { name: "Dilshod Nazarov", phone: "+998901110005", cat: "konditsioner", specialty: "Konditsioner ustasi", avatar: "/img/avatars/m5.jpg", cover: "/img/covers/ac.jpg", exp: 8, rate: 110000, region: T, district: "Yunusobod", verified: "APPROVED", available: true, telegram: "dilshod_ac", daysAgo: 300, bio: "Barcha brend konditsionerlarini o‘rnatish, tozalash va freon to‘ldirish. Rasmiy kafolat bilan ishlayman. Yozgi mavsumda ham navbatsiz xizmat." },
  { name: "Rustam Qodirov", phone: "+998901110006", cat: "konditsioner", specialty: "HVAC muhandisi", cover: "/img/covers/appliance-2.jpg", exp: 4, rate: 90000, region: T, district: "Sergeli", verified: "PENDING", available: true, daysAgo: 20, bio: "Konditsioner va ventilyatsiya tizimlarini o‘rnatish va servis xizmati. Ishga mas’uliyat bilan yondashaman." },
  { name: "Farrux Ergashev", phone: "+998901110007", cat: "mebel", specialty: "Mebel ustasi", avatar: "/img/avatars/m6.jpg", cover: "/img/covers/carpenter.jpg", exp: 11, rate: 120000, region: T, district: "Olmazor", verified: "APPROVED", available: true, daysAgo: 420, bio: "Oshxona, shkaf-kupe, bolalar xonasi va ofis mebellarini buyurtma asosida yasayman. 3D dizayn bepul. O‘z sexim bor." },
  { name: "Akmal Saidov", phone: "+998901110008", cat: "mebel", specialty: "Mebel yig‘uvchi", avatar: "/img/avatars/m7.jpg", cover: "/img/covers/carpenter-2.jpg", exp: 5, rate: 80000, region: T, district: "Shayxontohur", verified: "APPROVED", available: true, daysAgo: 150, bio: "IKEA va boshqa do‘kon mebellarini tez yig‘aman. Mebel ta’mirlash, petlya va tortmalarni rostlash." },
  { name: "Shohruh Mirzayev", phone: "+998901110009", cat: "quruvchi", specialty: "Quruvchi-prorab", avatar: "/img/avatars/m8.jpg", cover: "/img/covers/gen-builder.jpg", exp: 18, rate: 150000, region: T, district: "Bektemir", verified: "APPROVED", available: true, daysAgo: 600, bio: "Xususiy uylar qurilishi va kapital ta’mir bo‘yicha brigada boshlig‘iman. 18 yil davomida 120 dan ortiq obyekt topshirganmiz. Smeta bepul." },
  { name: "Ulug‘bek Hasanov", phone: "+998901110010", cat: "quruvchi", specialty: "Quruvchi", cover: "/img/covers/builder-2.jpg", exp: 7, rate: 100000, region: "Samarqand viloyati", district: "Samarqand shahri", verified: "APPROVED", available: true, daysAgo: 250, bio: "G‘isht terish, gazoblok devorlar va ichki pardevorlar. Samarqand shahri va atrofida ishlayman." },
  { name: "Javlon Umarov", phone: "+998901110011", cat: "beton", specialty: "Beton ustasi", avatar: "/img/avatars/m9.jpg", cover: "/img/covers/concrete.jpg", exp: 10, rate: 110000, region: T, district: "Yangihayot", verified: "APPROVED", available: true, daysAgo: 330, bio: "Poydevor, styajka va monolit ishlari. O‘z betonqorgichim va vibratorim bor." },
  { name: "Sanjar Abdullayev", phone: "+998901110012", cat: "tom-yopish", specialty: "Tom yopuvchi usta", avatar: "/img/avatars/m10.jpg", cover: "/img/covers/gen-roofer.jpg", exp: 13, rate: 120000, region: "Toshkent viloyati", district: "Qibray", verified: "APPROVED", available: true, daysAgo: 380, bio: "Metallocherepitsa, profnastil va yumshoq tom. Tomni yopish, ta’mirlash va tarnov tizimlari. Ishlarga 3 yil kafolat." },
  { name: "Bobur Xolmatov", phone: "+998901110013", cat: "tom-yopish", specialty: "Tom ustasi", cover: "/img/covers/roofer-2.jpg", exp: 3, rate: 80000, region: T, district: "Uchtepa", verified: "NONE", available: false, daysAgo: 10, bio: "Tom ta’mirlash va germetiklash bo‘yicha yosh, mas’uliyatli usta." },
  { name: "Islom Turg‘unov", phone: "+998901110014", cat: "payvandchi", specialty: "Payvandchi", avatar: "/img/avatars/m11.jpg", cover: "/img/covers/welder.jpg", exp: 14, rate: 120000, region: T, district: "Sergeli", verified: "APPROVED", available: true, daysAgo: 450, bio: "Darvoza, panjara, ayvon va metall konstruksiyalar. Argon va yarim avtomat payvand. Chizma bo‘yicha ishlayman." },
  { name: "Nodira Karimova", phone: "+998901110015", cat: "boyoqchi", specialty: "Bo‘yoqchi-dekorator", avatar: "/img/avatars/w1.jpg", cover: "/img/covers/painter-2.jpg", exp: 7, rate: 90000, region: T, district: "Mirobod", verified: "APPROVED", available: true, telegram: "nodira_decor", daysAgo: 280, bio: "Devorlarni bo‘yash va dekorativ qoplamalar (venetsiya, barxat, beton effekti). Ranglarni tanlashda bepul maslahat beraman." },
  { name: "Mansur Rajabov", phone: "+998901110016", cat: "suvoqchi", specialty: "Suvoqchi", avatar: "/img/avatars/m12.jpg", cover: "/img/covers/plaster.jpg", exp: 16, rate: 100000, region: T, district: "Yashnobod", verified: "APPROVED", available: true, daysAgo: 520, bio: "Mayoq bo‘yicha suvoq, shpaklyovka va gipsokarton. Devorlarni mukammal tekislayman." },
  { name: "Zafar Sobirov", phone: "+998901110017", cat: "kafel", specialty: "Kafel ustasi", avatar: "/img/avatars/m13.jpg", cover: "/img/covers/tiler.jpg", exp: 12, rate: 120000, region: T, district: "Chilonzor", verified: "APPROVED", available: true, daysAgo: 390, bio: "Kafel, keramogranit va mozaika. Hammom va oshxonani to‘liq ta’mirlayman. Choklar ideal tekis." },
  { name: "Doniyor Ismoilov", phone: "+998901110018", cat: "kafel", specialty: "Kafel va keramogranit", cover: "/img/covers/site.jpg", exp: 2, rate: 70000, region: "Buxoro viloyati", district: "Buxoro shahri", verified: "NONE", available: true, daysAgo: 5, bio: "Kafel yotqizish bo‘yicha yangi, lekin tajribali usta. Narxlar hamyonbop." },
  { name: "Eldor Raximov", phone: "+998901110019", cat: "eshik-deraza", specialty: "Eshik va deraza ustasi", cover: "/img/covers/windows.jpg", exp: 9, rate: 100000, region: T, district: "Yunusobod", verified: "APPROVED", available: true, daysAgo: 310, bio: "Plastik va alyumin derazalar, ichki va kirish eshiklari. Qulf almashtirish va rostlash ishlari." },
  { name: "Sherzod Po‘latov", phone: "+998901110020", cat: "maishiy-texnika", specialty: "Maishiy texnika ustasi", cover: "/img/covers/appliance.jpg", exp: 10, rate: 100000, region: T, district: "Mirzo Ulug‘bek", verified: "APPROVED", available: true, daysAgo: 340, bio: "Kir yuvish mashinasi, muzlatkich, gaz plita va mikroto‘lqinli pechlarni ta’mirlayman. Original ehtiyot qismlar." },
  { name: "Behruz Nurmatov", phone: "+998901110021", cat: "maishiy-texnika", specialty: "Muzlatkich ustasi", cover: "/img/covers/appliance-2.jpg", exp: 6, rate: 90000, region: "Farg‘ona viloyati", district: "Farg‘ona shahri", verified: "APPROVED", available: false, daysAgo: 160, bio: "Muzlatkich va konditsionerlarga freon to‘ldirish, kompressor almashtirish." },
  { name: "Temur Jo‘rayev", phone: "+998901110022", cat: "avto", specialty: "Avtomexanik", cover: "/img/covers/mechanic.jpg", exp: 11, rate: 110000, region: T, district: "Olmazor", verified: "APPROVED", available: true, daysAgo: 410, bio: "Chevrolet va xorijiy avtomobillar diagnostikasi va ta’miri. Kompyuter diagnostika, xodovoy va dvigatel." },
  { name: "Alisher Murodov", phone: "+998901110023", cat: "avto", specialty: "Avto-elektrik", cover: "/img/covers/mechanic-2.jpg", exp: 4, rate: 80000, region: "Andijon viloyati", district: "Andijon shahri", verified: "NONE", available: true, daysAgo: 12, bio: "Avtomobil elektr tizimlari, signalizatsiya va akkumulyator xizmati." },
  { name: "Komil Sharipov", phone: "+998901110024", cat: "boshqa", specialty: "Universal usta (“Muj na chas”)", cover: "/img/covers/handyman.jpg", exp: 8, rate: 100000, region: T, district: "Yakkasaroy", verified: "APPROVED", available: true, daysAgo: 230, bio: "Uydagi har qanday mayda ishlar: javon osish, karniz, televizor o‘rnatish, mebel yig‘ish. Bir chaqiruvda bir nechta ishni bajaraman." },
  { name: "Malika Yo‘ldosheva", phone: "+998901110025", cat: "boyoqchi", specialty: "Bo‘yoqchi", avatar: "/img/avatars/w2.jpg", cover: "/img/covers/painter.jpg", exp: 3, rate: 70000, region: "Samarqand viloyati", district: "Samarqand shahri", verified: "PENDING", available: true, daysAgo: 8, bio: "Kvartira va ofislarni bo‘yash, oboy yopishtirish. Tez va toza ishlayman." },
];

const CLIENTS = [
  { name: "Aziz Karimov", phone: "+998901234567", region: T, district: "Yunusobod", address: "Yunusobod 4-kvartal, 12-uy, 45-xonadon" },
  { name: "Gulnora Ahmedova", phone: "+998901110101", avatar: "/img/avatars/w3.jpg", region: T, district: "Chilonzor" },
  { name: "Kamola Rasulova", phone: "+998901110102", avatar: "/img/avatars/w4.jpg", region: T, district: "Mirobod" },
  { name: "Rustam Ibragimov", phone: "+998901110103", region: T, district: "Sergeli" },
  { name: "Dilnoza Saidova", phone: "+998901110104", avatar: "/img/avatars/w5.jpg", region: T, district: "Yakkasaroy" },
  { name: "Shahzod Valiyev", phone: "+998901110105", region: "Samarqand viloyati", district: "Samarqand shahri" },
  { name: "Madina Xasanova", phone: "+998901110106", avatar: "/img/avatars/w6.jpg", region: T, district: "Olmazor" },
  { name: "Ilhom Qosimov", phone: "+998901110107", region: T, district: "Yashnobod" },
];

const REVIEW_TEXTS: [number, string][] = [
  [5, "Juda zo‘r usta! Vaqtida keldi, ishni toza va sifatli bajardi. Hammaga tavsiya qilaman."],
  [5, "Narxi kelishilganidek bo‘ldi, qo‘shimcha pul so‘ramadi. Rahmat, yana murojaat qilaman."],
  [4, "Ish sifati yaxshi, faqat 20 daqiqaga kechikdi. Umuman olganda mamnunman."],
  [5, "Professional yondashuv. Hamma narsani tushuntirib berdi, maslahatlar berdi."],
  [5, "Tez va sifatli! Ishdan keyin hammasini tozalab ketdi. Katta rahmat."],
  [4, "Yaxshi usta, ishini biladi. Materiallarni o‘zi olib keldi, bu qulay bo‘ldi."],
  [5, "Ikkinchi marta chaqiryapman — har safar a’lo darajada. Ishonchli usta."],
  [3, "Ish bajarildi, lekin biroz uzoq davom etdi. Natija yomon emas."],
  [5, "Muloyim va madaniyatli. Ishni kafolat bilan qildi. Tavsiya qilaman!"],
];

const PORTFOLIO_BY_CAT: Record<string, [string, string][]> = {
  elektrik: [["/img/portfolio/p6.jpg", "Mehmonxonada yoritish tizimi"], ["/img/portfolio/p24.jpg", "Spot chiroqlar montaji"], ["/img/portfolio/p13.jpg", "Yotoqxona yoritilishi"]],
  santexnik: [["/img/portfolio/p1.jpg", "Hammom santexnikasi"], ["/img/portfolio/p2.jpg", "Dush kabina o‘rnatish"], ["/img/portfolio/p5.jpg", "Rakovina va smesitel"]],
  konditsioner: [["/img/portfolio/p4.jpg", "Ofisda split tizim"], ["/img/portfolio/p9.jpg", "Mehmonxonada konditsioner"], ["/img/portfolio/p23.jpg", "Yashash xonasi"]],
  mebel: [["/img/portfolio/p7.jpg", "Oq oshxona mebeli"], ["/img/portfolio/p22.jpg", "Zamonaviy oshxona"], ["/img/portfolio/p11.jpg", "Charm divan restavratsiyasi"], ["/img/portfolio/p20.jpg", "Qora oshxona to‘plami"]],
  quruvchi: [["/img/portfolio/p3.jpg", "Xususiy uy fasadi"], ["/img/portfolio/p16.jpg", "Hovuzli villa"], ["/img/portfolio/p18.jpg", "Ikki qavatli uy"], ["/img/portfolio/p25.jpg", "Ko‘p qavatli obyekt"]],
  beton: [["/img/portfolio/p26.jpg", "Poydevor uchun kotlovan"], ["/img/portfolio/p25.jpg", "Monolit karkas"], ["/img/portfolio/p17.jpg", "Hovli va zinapoya"]],
  "tom-yopish": [["/img/portfolio/p15.jpg", "Xususiy uy tomi"], ["/img/portfolio/p12.jpg", "Mansard tom"], ["/img/portfolio/p3.jpg", "Yassi tom"]],
  payvandchi: [["/img/portfolio/p17.jpg", "Metall zinapoya"], ["/img/portfolio/p19.jpg", "Ayvon karkasi"], ["/img/portfolio/p16.jpg", "Hovli panjarasi"]],
  boyoqchi: [["/img/portfolio/p14.jpg", "Yashil aksent devor"], ["/img/portfolio/p23.jpg", "Dekorativ bo‘yoq"], ["/img/portfolio/p8.jpg", "Yorug‘ mehmonxona"]],
  suvoqchi: [["/img/portfolio/p30.jpg", "Devorlarni tekislash"], ["/img/portfolio/p21.jpg", "Shpaklyovka va bo‘yoq"], ["/img/portfolio/p13.jpg", "Gipsokarton shift"]],
  kafel: [["/img/portfolio/p1.jpg", "Hammom kafeli"], ["/img/portfolio/p2.jpg", "Dush zonasi"], ["/img/portfolio/p5.jpg", "Hammom devorlari"], ["/img/portfolio/p10.jpg", "Oshxona fartugi"]],
  "eshik-deraza": [["/img/portfolio/p19.jpg", "Panoramali derazalar"], ["/img/portfolio/p27.jpg", "Aqlli qulf o‘rnatish"], ["/img/portfolio/p4.jpg", "Plastik derazalar"]],
  "maishiy-texnika": [["/img/portfolio/p10.jpg", "Oshxona texnikasi"], ["/img/portfolio/p7.jpg", "O‘rnatilgan texnika"], ["/img/portfolio/p20.jpg", "Duxovka ta’miri"]],
  avto: [["/img/portfolio/p28.jpg", "Asboblar to‘plami"], ["/img/portfolio/p29.jpg", "Diagnostika ishlari"], ["/img/portfolio/p25.jpg", "Servis markazi"]],
  boshqa: [["/img/portfolio/p28.jpg", "Mayda ishlar"], ["/img/portfolio/p9.jpg", "Javon va rasm osish"], ["/img/portfolio/p24.jpg", "Televizor o‘rnatish"]],
};

const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, (n * 7) % 60, 0, 0);
  return d;
};
const hoursFromNow = (h: number) => new Date(Date.now() + h * 3_600_000);

async function main() {
  console.log("🧹 Eski ma’lumotlar tozalanmoqda...");
  await db.$transaction([
    db.realtimeEvent.deleteMany(),
    db.complaint.deleteMany(),
    db.notification.deleteMany(),
    db.message.deleteMany(),
    db.conversation.deleteMany(),
    db.payment.deleteMany(),
    db.orderEvent.deleteMany(),
    db.orderItem.deleteMany(),
    db.review.deleteMany(),
    db.order.deleteMany(),
    db.favorite.deleteMany(),
    db.portfolioItem.deleteMany(),
    db.service.deleteMany(),
    db.masterProfile.deleteMany(),
    db.user.deleteMany(),
    db.category.deleteMany(),
    db.setting.deleteMany(),
  ]);

  const pw = await bcrypt.hash("demo123", 10);
  const adminPw = await bcrypt.hash("admin123", 10);

  console.log("📂 Kategoriyalar...");
  const cats: Record<string, string> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const row = await db.category.create({ data: { ...c, image: `/img/categories/${c.slug}.jpg`, sortOrder: i } });
    cats[c.slug] = row.id;
  }

  console.log("⚙️  Sozlamalar...");
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) await db.setting.create({ data: { key, value } });

  console.log("👤 Admin va mijozlar...");
  await db.user.create({ data: { name: "Admin UstaTop", phone: "+998990000000", email: "admin@ustatop.uz", passwordHash: adminPw, role: "ADMIN", region: T, district: "Mirobod" } });
  const clients = [];
  for (const [i, c] of CLIENTS.entries()) {
    clients.push(await db.user.create({ data: { ...c, passwordHash: pw, role: "CLIENT", createdAt: daysAgo(60 - i * 6) } }));
  }
  const demoClient = clients[0];

  console.log("🛠  Ustalar, xizmatlar, portfolio...");
  const masters: { id: string; userId: string; cat: string; services: { id: string; title: string; price: number }[]; name: string }[] = [];
  for (const [i, m] of MASTERS.entries()) {
    const coords = locate(m.region, m.district);
    const jitter = () => (Math.random() - 0.5) * 0.02;
    const user = await db.user.create({
      data: { name: m.name, phone: m.phone, avatar: m.avatar, passwordHash: pw, role: "MASTER", region: m.region, district: m.district, createdAt: daysAgo(m.daysAgo) },
    });
    const svcDefs = SERVICES[m.cat];
    // Har bir usta o‘z narxlariga ega bo‘lsin (±15%)
    const factor = 0.85 + ((i * 37) % 30) / 100;
    const profile = await db.masterProfile.create({
      data: {
        userId: user.id,
        categoryId: cats[m.cat],
        specialty: m.specialty,
        bio: m.bio,
        coverImage: m.cover,
        experienceYears: m.exp,
        hourlyRate: m.rate,
        isAvailable: m.available,
        verification: m.verified,
        region: m.region,
        district: m.district,
        address: `${m.district}, ${m.region}`,
        lat: coords.lat + jitter(),
        lng: coords.lng + jitter(),
        publicPhone: m.phone,
        telegram: m.telegram,
        workStart: i % 3 === 0 ? "08:00" : "09:00",
        workEnd: i % 4 === 0 ? "20:00" : "18:00",
        workDays: i % 5 === 0 ? "1,2,3,4,5,6,7" : "1,2,3,4,5,6",
        createdAt: daysAgo(m.daysAgo),
        services: {
          create: svcDefs.slice(0, i % 2 === 0 ? svcDefs.length : Math.max(3, svcDefs.length - 1)).map(([title, price, unit, duration, description], k) => ({
            title,
            price: Math.round((price * factor) / 5000) * 5000 || 5000,
            priceUnit: unit,
            durationText: duration,
            description,
            categoryId: cats[m.cat],
            image: k === 0 ? `/img/categories/${m.cat}.jpg` : PORTFOLIO_BY_CAT[m.cat][(k - 1) % PORTFOLIO_BY_CAT[m.cat].length][0],
          })),
        },
        portfolio: {
          create: PORTFOLIO_BY_CAT[m.cat].slice(0, m.verified === "NONE" ? 1 : 4).map(([image, title]) => ({
            image,
            title,
            description: `${m.specialty} tomonidan bajarilgan ish`,
          })),
        },
      },
      include: { services: { select: { id: true, title: true, price: true } } },
    });
    masters.push({ id: profile.id, userId: user.id, cat: m.cat, services: profile.services, name: m.name });
  }

  console.log("⭐ Yakunlangan buyurtmalar va sharhlar...");
  let codeN = 1000;
  const code = () => `UT-${(codeN++).toString(36).toUpperCase().padStart(6, "A")}`;
  for (const [mi, m] of masters.entries()) {
    const def = MASTERS[mi];
    if (def.verified === "NONE" && mi % 2 === 0) continue;
    const reviewCount = def.verified === "APPROVED" ? 2 + ((mi * 7) % 4) : 1;
    for (let r = 0; r < reviewCount; r++) {
      const client = clients[(mi + r) % clients.length];
      const svc = m.services[r % m.services.length];
      const [rating, comment] = REVIEW_TEXTS[(mi * 3 + r) % REVIEW_TEXTS.length];
      const when = daysAgo(5 + r * 9 + (mi % 7), 11);
      const order = await db.order.create({
        data: {
          code: code(),
          clientId: client.id,
          masterId: m.id,
          status: "COMPLETED",
          description: `${svc.title} kerak edi. Iltimos, vaqtida keling.`,
          region: client.region ?? T,
          district: client.district ?? "Yunusobod",
          address: `${client.district}, ${10 + r}-uy`,
          scheduledAt: when,
          completedAt: when,
          totalAmount: svc.price,
          paymentMethod: r % 2 ? "CASH" : "PAYME",
          paymentStatus: "PAID",
          createdAt: new Date(when.getTime() - 86_400_000),
          items: { create: { serviceId: svc.id, title: svc.title, price: svc.price, quantity: 1 } },
          events: {
            create: [
              { status: "NEW", note: "Buyurtma yaratildi", createdAt: new Date(when.getTime() - 86_400_000) },
              { status: "ACCEPTED", note: "Usta buyurtmani qabul qildi", createdAt: new Date(when.getTime() - 80_000_000) },
              { status: "IN_PROGRESS", note: "Usta ishni boshladi", createdAt: when },
              { status: "COMPLETED", note: "Ish yakunlandi", createdAt: new Date(when.getTime() + 7_200_000) },
            ],
          },
          payments: { create: { provider: r % 2 ? "CASH" : "PAYME", amount: svc.price, status: "SUCCESS", mode: r % 2 ? "cash" : "demo", transactionId: `DEMO-SEED${mi}${r}` } },
        },
      });
      await db.review.create({
        data: {
          masterId: m.id,
          clientId: client.id,
          orderId: order.id,
          rating,
          comment,
          createdAt: new Date(when.getTime() + 10_800_000),
          reply: r === 0 && rating >= 4 ? "Rahmat! Sizga xizmat ko‘rsatganimdan xursandman." : null,
        },
      });
    }
    const agg = await db.review.aggregate({ where: { masterId: m.id }, _avg: { rating: true }, _count: { _all: true } });
    await db.masterProfile.update({
      where: { id: m.id },
      data: {
        rating: Math.round((agg._avg.rating ?? 0) * 10) / 10,
        reviewCount: agg._count._all,
        completedJobs: agg._count._all + def.exp * 9 + (mi % 5) * 4,
        // Mashhurlik: tajriba, sharhlar, tasdiq va ko‘rishlar asosida
        popularity: def.exp * 6 + agg._count._all * 12 + (def.verified === "APPROVED" ? 40 : 0) + ((mi * 17) % 25),
      },
    });
  }

  console.log("📦 Demo mijoz buyurtmalari (barcha holatlar)...");
  const sardor = masters[0];
  const nodira = masters.find((m) => m.name === "Nodira Karimova")!;
  const bekzod = masters.find((m) => m.name === "Bekzod Aliyev")!;
  const dilshod = masters.find((m) => m.name === "Dilshod Nazarov")!;
  const zafar = masters.find((m) => m.name === "Zafar Sobirov")!;

  type Demo = { m: typeof sardor; client: (typeof clients)[number]; status: string; items: number[]; at: Date; desc: string; pay?: [string, string] };
  const demos: Demo[] = [
    { m: sardor, client: demoClient, status: "NEW", items: [0, 1], at: hoursFromNow(26), desc: "Mehmonxonaga 3 ta rozetka va 1 ta lyustra o‘rnatish kerak. Lyustra o‘zimizda bor." },
    { m: dilshod, client: demoClient, status: "ACCEPTED", items: [1], at: hoursFromNow(50), desc: "Yotoqxonadagi konditsioner yomon sovutyapti, tozalash kerak.", pay: ["CLICK", "PAID"] },
    { m: nodira, client: demoClient, status: "IN_PROGRESS", items: [0], at: hoursFromNow(-3), desc: "Bolalar xonasi devorlarini (taxminan 35 m²) och sariq rangga bo‘yash." },
    { m: bekzod, client: demoClient, status: "CANCELLED", items: [0], at: daysAgo(3), desc: "Oshxona smesiteli oqyapti." },
    { m: zafar, client: demoClient, status: "PENDING", items: [0], at: hoursFromNow(75), desc: "Hammom poliga 6 m² kafel yotqizish. Kafel sotib olingan." },
    // Usta (Sardor) uchun boshqa mijozlardan buyurtmalar
    { m: sardor, client: clients[1], status: "ACCEPTED", items: [2], at: hoursFromNow(5), desc: "2 xonali kvartirada eski simlarni almashtirish kerak." },
    { m: sardor, client: clients[2], status: "IN_PROGRESS", items: [3], at: hoursFromNow(-2), desc: "Yangi kvartiraga avtomat shchit yig‘ib berish.", pay: ["PAYME", "PAID"] },
    { m: sardor, client: clients[4], status: "NEW", items: [4], at: hoursFromNow(30), desc: "Oshxonada rozetkalar ishlamay qoldi, avtomat tushib ketyapti." },
  ];
  const created: { id: string; status: string; clientId: string; m: typeof sardor }[] = [];
  for (const d of demos) {
    const svcs = d.items.map((k) => d.m.services[k % d.m.services.length]);
    const qty = (k: number) => (d.m === nodira ? 35 : k === 0 && d.m === sardor ? 3 : 1);
    const total = svcs.reduce((s, x, k) => s + x.price * qty(k), 0);
    const flow = ["NEW", "PENDING", "ACCEPTED", "IN_PROGRESS"];
    const reached = d.status === "CANCELLED" ? ["NEW", "CANCELLED"] : flow.slice(0, flow.indexOf(d.status) + 1);
    const createdAt = new Date(Math.min(Date.now() - 3_600_000, d.at.getTime() - 86_400_000));
    const order = await db.order.create({
      data: {
        code: code(),
        clientId: d.client.id,
        masterId: d.m.id,
        status: d.status,
        description: d.desc,
        region: d.client.region ?? T,
        district: d.client.district ?? "Yunusobod",
        address: d.client.address ?? `${d.client.district}, 7-uy`,
        scheduledAt: d.at,
        totalAmount: total,
        paymentMethod: d.pay?.[0] ?? "CASH",
        paymentStatus: d.pay?.[1] ?? "UNPAID",
        cancelReason: d.status === "CANCELLED" ? "Muammo o‘zim hal qildim" : null,
        cancelledBy: d.status === "CANCELLED" ? "CLIENT" : null,
        createdAt,
        items: { create: svcs.map((s, k) => ({ serviceId: s.id, title: s.title, price: s.price, quantity: qty(k) })) },
        events: {
          create: reached.map((s, k) => ({
            status: s,
            note: { NEW: "Buyurtma yaratildi", PENDING: "Usta buyurtmani ko‘rib chiqmoqda", ACCEPTED: "Usta buyurtmani qabul qildi", IN_PROGRESS: "Usta ishni boshladi", CANCELLED: "Buyurtma bekor qilindi: Muammo o‘zim hal qildim" }[s],
            createdAt: new Date(createdAt.getTime() + k * 1_800_000),
          })),
        },
        ...(d.pay ? { payments: { create: { provider: d.pay[0], amount: total, status: "SUCCESS", mode: "demo", transactionId: `DEMO-${code()}`, cardMask: "8600 **** **** 4512" } } } : {}),
      },
    });
    created.push({ id: order.id, status: d.status, clientId: d.client.id, m: d.m });
  }

  console.log("💬 Suhbatlar...");
  const chat = async (clientId: string, m: typeof sardor, orderId: string | null, lines: [who: "c" | "m", text: string, minsAgo: number, read?: boolean][], image?: string) => {
    const conv = await db.conversation.create({ data: { clientId, masterId: m.id, orderId } });
    let last = new Date();
    for (const [who, text, mins, read = true] of lines) {
      last = new Date(Date.now() - mins * 60_000);
      await db.message.create({
        data: { conversationId: conv.id, senderId: who === "c" ? clientId : m.userId, text, createdAt: last, readAt: read ? new Date(last.getTime() + 60_000) : null },
      });
    }
    if (image) await db.message.create({ data: { conversationId: conv.id, senderId: clientId, image, createdAt: new Date(last.getTime() + 30_000), readAt: new Date() } });
    await db.conversation.update({ where: { id: conv.id }, data: { lastMessageAt: last } });
  };
  for (const c of created) {
    if (c.status === "CANCELLED") continue;
    if (c.m === sardor && c.clientId === demoClient.id) {
      await chat(c.clientId, c.m, c.id, [
        ["c", "Assalomu alaykum! Ertaga tushdan keyin kela olasizmi?", 180],
        ["m", "Va alaykum assalom! Ha, soat 14:00 da kela olaman.", 170],
        ["c", "Zo‘r, lyustra og‘irroq, ikki kishi kerak bo‘lmaydimi?", 160],
        ["m", "Muammo yo‘q, o‘zim o‘rnataman. Shift betonmi yoki gipsokarton?", 25, false],
      ]);
    } else if (c.m === nodira) {
      await chat(c.clientId, c.m, c.id, [
        ["m", "Salom! Bo‘yoq rangini tanladingizmi?", 300],
        ["c", "Ha, mana shu rangni xohlayman — och sariq, matoviy.", 290],
        ["m", "Ajoyib tanlov. Ikki qavat bo‘yayman, ertaga kechgacha tugatamiz.", 280],
      ], "/img/portfolio/p23.jpg");
    } else if (c.m === dilshod) {
      await chat(c.clientId, c.m, c.id, [
        ["c", "Konditsioner modeli Artel 12, 3 yil bo‘ldi.", 1500],
        ["m", "Tushunarli. Tozalash va freon tekshiruvini qilamiz. Kelishilgan vaqtda boraman.", 1490],
      ]);
    } else if (c.m === sardor) {
      await chat(c.clientId, c.m, c.id, [["c", "Assalomu alaykum, manzilni yuborgan edim. Qachon kelasiz?", 40, false]]);
    }
  }
  await chat(demoClient.id, masters.find((m) => m.name === "Farrux Ergashev")!, null, [
    ["c", "Salom! Oshxona mebeli uchun taxminiy narx qancha bo‘ladi? Uzunligi 3.2 metr.", 4000],
    ["m", "Assalomu alaykum! Material va furnituraga qarab 3.5–5 mln oralig‘ida. Bepul o‘lchov olish uchun borishim mumkin.", 3900],
    ["c", "Yaxshi, keyingi haftada bog‘lanaman.", 3880],
  ]);

  console.log("❤️  Sevimlilar va bildirishnomalar...");
  for (const m of [sardor, nodira, zafar, masters[6]]) await db.favorite.create({ data: { userId: demoClient.id, masterId: m.id } });
  const notes = [
    { userId: demoClient.id, type: "ORDER", title: "Usta buyurtmani qabul qildi", body: "Dilshod Nazarov konditsioner tozalash buyurtmangizni qabul qildi.", link: `/buyurtmalar/${created[1].id}`, readAt: new Date() },
    { userId: demoClient.id, type: "ORDER", title: "Ish boshlandi", body: "Nodira Karimova bo‘yash ishlarini boshladi.", link: `/buyurtmalar/${created[2].id}` },
    { userId: demoClient.id, type: "MESSAGE", title: "Sardor Rahimov xabar yubordi", body: "Muammo yo‘q, o‘zim o‘rnataman. Shift betonmi yoki gipsokarton?", link: "/xabarlar" },
    { userId: demoClient.id, type: "SYSTEM", title: "UstaTop’ga xush kelibsiz!", body: "Kerakli ustani toping va bir necha daqiqada buyurtma bering.", link: "/", readAt: new Date() },
    { userId: sardor.userId, type: "ORDER", title: "Yangi buyurtma", body: "Aziz Karimov sizga yangi buyurtma yubordi.", link: `/buyurtmalar/${created[0].id}` },
    { userId: sardor.userId, type: "ORDER", title: "Yangi buyurtma", body: "Dilnoza Saidova sizga yangi buyurtma yubordi.", link: `/buyurtmalar/${created[7].id}` },
    { userId: sardor.userId, type: "PAYMENT", title: "To‘lov qabul qilindi", body: "Kamola Rasulova buyurtmasi uchun Payme orqali to‘lov qilindi.", link: `/buyurtmalar/${created[6].id}`, readAt: new Date() },
  ];
  for (const [k, n] of notes.entries()) await db.notification.create({ data: { ...n, createdAt: new Date(Date.now() - (k + 1) * 3_000_000) } });

  console.log("🚩 Shikoyatlar...");
  const someReview = await db.review.findFirst({ where: { rating: 3 } });
  await db.complaint.create({ data: { reporterId: clients[3].id, targetUserId: masters.find((m) => m.name === "Bobur Xolmatov")!.userId, reason: "Usta kelmadi", details: "Kelishilgan vaqtda kelmadi va telefonni ko‘tarmadi." } });
  if (someReview) await db.complaint.create({ data: { reporterId: masters[0].userId, reviewId: someReview.id, reason: "Haqoratli sharh", details: "Sharh adolatsiz yozilgan deb hisoblayman." } });
  await db.complaint.create({ data: { reporterId: clients[1].id, targetUserId: masters[1].userId, reason: "Narx kelishilganidan oshirildi", details: "Ish oxirida qo‘shimcha 50 000 so‘m so‘radi.", status: "RESOLVED", adminNote: "Usta bilan suhbat o‘tkazildi, ogohlantirildi." } });

  console.log("🔎 Qidiruv indeksi...");
  const all = await db.masterProfile.findMany({ include: { user: true, category: true, services: true } });
  for (const m of all) {
    const searchText = normalizeSearch([m.user.name, m.specialty, m.category.name, m.region, m.district, ...m.services.map((s) => s.title), m.bio.slice(0, 300)].join(" "));
    const priceFrom = m.services.length ? Math.min(...m.services.map((s) => s.price)) : m.hourlyRate;
    await db.masterProfile.update({ where: { id: m.id }, data: { searchText, priceFrom } });
  }

  console.log("\n✅ Tayyor! Demo hisoblar (parol):");
  console.log("   Mijoz : +998 90 123 45 67  (demo123)");
  console.log("   Usta  : +998 91 234 56 78  (demo123)");
  console.log("   Admin : +998 99 000 00 00  (admin123)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
