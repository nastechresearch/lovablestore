"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import {
  DEFAULT_SETTINGS,
  settingsToRows,
  type StoreSettings,
} from "@/lib/settings";
import { text, type FormState } from "@/lib/form";

function integer(
  formData: FormData,
  key: keyof StoreSettings,
  min: number,
  max: number,
  label: string,
): number | string {
  const raw = text(formData, key);
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < min || value > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return value;
}

export async function updateStoreSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const errors: Record<string, string> = {};

  const companyName = text(formData, "companyName").slice(0, 120);
  const registration = text(formData, "registration").slice(0, 60);
  const vatNumber = text(formData, "vatNumber").slice(0, 40);
  const companyAddress = text(formData, "companyAddress").slice(0, 220);
  const companyEmail = text(formData, "companyEmail").slice(0, 160);
  const companyPhone = text(formData, "companyPhone").slice(0, 60);
  const supportHours = text(formData, "supportHours").slice(0, 100);
  const announcement = text(formData, "announcement").slice(0, 120);

  if (companyName.length < 2) errors.companyName = "Enter the trading name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(companyEmail)) {
    errors.companyEmail = "Enter a valid invoice email address.";
  }

  const cutoff = integer(formData, "dispatchCutoffHour", 0, 23, "Cut-off hour");
  const localMin = integer(formData, "localLeadMin", 0, 40, "Local minimum lead time");
  const localMax = integer(formData, "localLeadMax", 0, 60, "Local maximum lead time");
  const globalMin = integer(formData, "globalLeadMin", 1, 60, "Global minimum lead time");
  const globalMax = integer(formData, "globalLeadMax", 1, 90, "Global maximum lead time");
  const threshold = integer(
    formData,
    "freeShippingThreshold",
    0,
    1_000_000,
    "Free-shipping threshold",
  );
  const shipping = integer(formData, "shippingFee", 0, 100_000, "Delivery fee");

  for (const [key, value] of Object.entries({
    dispatchCutoffHour: cutoff,
    localLeadMin: localMin,
    localLeadMax: localMax,
    globalLeadMin: globalMin,
    globalLeadMax: globalMax,
    freeShippingThreshold: threshold,
    shippingFee: shipping,
  })) {
    if (typeof value === "string") errors[key] = value;
  }
  if (typeof localMin === "number" && typeof localMax === "number" && localMin > localMax) {
    errors.localLeadMax = "Local maximum must be at least the minimum.";
  }
  if (typeof globalMin === "number" && typeof globalMax === "number" && globalMin > globalMax) {
    errors.globalLeadMax = "Global maximum must be at least the minimum.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Check the highlighted settings.", fieldErrors: errors };
  }

  const settings: StoreSettings = {
    ...DEFAULT_SETTINGS,
    companyName,
    registration,
    vatNumber,
    companyAddress,
    companyEmail,
    companyPhone,
    supportHours,
    announcement,
    dispatchCutoffHour: cutoff as number,
    localLeadMin: localMin as number,
    localLeadMax: localMax as number,
    globalLeadMin: globalMin as number,
    globalLeadMax: globalMax as number,
    freeShippingThreshold: threshold as number,
    shippingFee: shipping as number,
  };

  await prisma.$transaction(
    settingsToRows(settings).map((row) =>
      prisma.storeSetting.upsert({
        where: { key: row.key },
        update: { value: row.value },
        create: row,
      }),
    ),
  );

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/studio");
  revalidatePath("/delivery-and-returns");
  revalidatePath("/track");
  return { status: "success", message: "Store settings saved." };
}
