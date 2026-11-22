import "server-only";
import { db } from "./db";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/constants";

export type Settings = Record<SettingKey, string>;

export async function getSettings(): Promise<Settings> {
  const rows = await db.setting.findMany();
  const out = { ...DEFAULT_SETTINGS } as Settings;
  for (const r of rows) if (r.key in out) out[r.key as SettingKey] = r.value;
  return out;
}

export async function getCommissionPercent(): Promise<number> {
  const s = await getSettings();
  const n = Number(s.commissionPercent);
  return Number.isFinite(n) && n >= 0 && n <= 50 ? n : 10;
}
