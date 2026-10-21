import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type StoreSettings = {
  companyName: string;
  registration: string;
  vatNumber: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  dispatchCutoffHour: number;
  localLeadMin: number;
  localLeadMax: number;
  globalLeadMin: number;
  globalLeadMax: number;
  supportHours: string;
  freeShippingThreshold: number;
  shippingFee: number;
  announcement: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  companyName: "Lovable Store",
  registration: "2026/493821/07",
  vatNumber: "4890317265",
  companyAddress: "18 Keyes Avenue, Rosebank, Johannesburg, 2196",
  companyEmail: "hello@lovablestore.co.za",
  companyPhone: "+27 10 003 4820",
  dispatchCutoffHour: 14,
  localLeadMin: 2,
  localLeadMax: 5,
  globalLeadMin: 10,
  globalLeadMax: 18,
  supportHours: "Mon–Sat, 09:00–18:00 SAST",
  freeShippingThreshold: 95000,
  shippingFee: 8500,
  announcement: "Complimentary gift wrap on every order",
};

const INTEGER_KEYS = new Set<keyof StoreSettings>([
  "dispatchCutoffHour",
  "localLeadMin",
  "localLeadMax",
  "globalLeadMin",
  "globalLeadMax",
  "freeShippingThreshold",
  "shippingFee",
]);

export const getStoreSettings = cache(async (): Promise<StoreSettings> => {
  try {
    const rows = await prisma.storeSetting.findMany();
    const merged: StoreSettings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      const key = row.key as keyof StoreSettings;
      if (!(key in DEFAULT_SETTINGS)) continue;
      if (INTEGER_KEYS.has(key)) {
        const parsed = Number.parseInt(row.value, 10);
        if (Number.isFinite(parsed)) {
          (merged[key] as number) = parsed;
        }
      } else {
        (merged[key] as string) = row.value;
      }
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export function settingsToRows(settings: StoreSettings): { key: string; value: string }[] {
  return (Object.keys(settings) as (keyof StoreSettings)[]).map((key) => ({
    key,
    value: String(settings[key]),
  }));
}
