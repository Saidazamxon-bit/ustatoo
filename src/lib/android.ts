/** Android (TWA) ilovasi haqida ma'lumot — android/app/build.gradle bilan mos bo‘lishi kerak */
export const ANDROID_APK = {
  packageName: "uz.ustatop.app",
  versionName: "1.3.1",
  versionCode: 3,
  url: "/downloads/ustatop-android.apk",
  /** Ulashish uchun qisqa havola: /ilova#android sahifasiga olib boradi */
  shortPath: "/android",
  sizeMb: "0.9",
  minAndroid: "7.0",
  releasedAt: "2026-11-22",
  /** sha256sum public/downloads/ustatop-android.apk */
  sha256: "c39f92434221a1297b51de58e88de11a5dbd0f5d40372348e6f008b904791fab",
};

/** Ilova Android TWA ichida ochilganmi (launchUrl ?source=twa yoki android-app:// referrer) */
export function isAndroidAppContext(search: string, referrer: string): boolean {
  return new URLSearchParams(search).get("source") === "twa" || referrer.startsWith(`android-app://${ANDROID_APK.packageName}`);
}
