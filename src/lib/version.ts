// Ilova versiyasi. Yangi reliz chiqarilganda APP_VERSION va changelog.ts yangilanadi.
// BUILD_ID har bir build uchun avtomatik (next.config.ts) — yangilanishni aniqlash shunga tayanadi.
export const APP_VERSION = "1.1.0";
export const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || "";

/** localStorage sxemasi versiyasi — saqlangan ma'lumotlar formati o‘zgarsa oshiriladi */
export const STORAGE_SCHEMA_VERSION = 1;
