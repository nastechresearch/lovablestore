"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { checkbox, centsFromRands, text, type FormState } from "@/lib/form";

const TYPES = ["PERCENT", "FIXED", "FREE_SHIPPING"];
const SCOPES = ["ALL", "CATEGORY", "TAG", "PRODUCT", "SUPPLIER", "SUPPLIER_KIND"];
const KINDS = ["LOCAL", "CHINA", "REGIONAL"];

async function parsePromo(formData: FormData, ignoreId?: string) {
  const errors: Record<string, string> = {};
  const code = text(formData, "code").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const label = text(formData, "label");
  const type = text(formData, "type") || "PERCENT";
  const scope = text(formData, "scope") || "ALL";
  const scopeValue = text(formData, "scopeValue") || null;
  const rawValue = Number(text(formData, "value") || "0");
  const minSubtotal = centsFromRands(text(formData, "minSubtotal")) ?? 0;
  const startsAtRaw = text(formData, "startsAt");
  const endsAtRaw = text(formData, "endsAt");
  const maxUsesRaw = text(formData, "maxUses");
  const active = checkbox(formData, "active");

  if (code.length < 3) errors.code = "Use at least three letters or numbers.";
  if (label.length < 3) errors.label = "Describe the offer.";
  if (!TYPES.includes(type)) errors.type = "Choose an offer type.";
  if (!SCOPES.includes(scope)) errors.scope = "Choose where this applies.";

  let value = 0;
  if (type === "PERCENT") {
    if (!Number.isFinite(rawValue) || rawValue <= 0 || rawValue > 100) {
      errors.value = "Percentage must be between 1 and 100.";
    } else value = Math.floor(rawValue);
  } else if (type === "FIXED") {
    const cents = centsFromRands(text(formData, "value"));
    if (!cents || cents <= 0) errors.value = "Enter a rand amount.";
    else value = cents;
  }

  if (scope === "CATEGORY" && !scopeValue) errors.scopeValue = "Choose a category.";
  if (scope === "TAG") {
    const tag = scopeValue
      ? await prisma.tag.findUnique({ where: { slug: scopeValue } })
      : null;
    if (!tag) errors.scopeValue = "Choose a tag.";
  }
  if (scope === "SUPPLIER") {
    const supplier = scopeValue
      ? await prisma.supplierConnection.findUnique({ where: { id: scopeValue } })
      : null;
    if (!supplier) errors.scopeValue = "Choose a supplier connection.";
  }
  if (scope === "SUPPLIER_KIND" && (!scopeValue || !KINDS.includes(scopeValue))) {
    errors.scopeValue = "Choose local or global sourcing.";
  }
  if (scope === "PRODUCT") {
    const product = scopeValue
      ? await prisma.product.findUnique({ where: { id: scopeValue } })
      : null;
    if (!product) errors.scopeValue = "Choose a product.";
  }

  const startsAt = startsAtRaw ? new Date(startsAtRaw) : null;
  const endsAt = endsAtRaw ? new Date(endsAtRaw) : null;
  if (startsAt && Number.isNaN(startsAt.getTime())) errors.startsAt = "Choose a valid start date.";
  if (endsAt && Number.isNaN(endsAt.getTime())) errors.endsAt = "Choose a valid end date.";
  if (startsAt && endsAt && endsAt <= startsAt) {
    errors.endsAt = "The end date must be after the start date.";
  }

  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  if (maxUses !== null && (!Number.isFinite(maxUses) || maxUses < 1)) {
    errors.maxUses = "Enter a whole number or leave blank.";
  }

  const existing = code
    ? await prisma.promo.findUnique({ where: { code } })
    : null;
  if (existing && existing.id !== ignoreId) errors.code = "That code already exists.";

  if (Object.keys(errors).length > 0) return { errors };

  return {
    errors,
    data: {
      code,
      label,
      description: text(formData, "description") || null,
      type,
      value,
      minSubtotal,
      scope,
      scopeValue: scope === "ALL" ? null : scopeValue,
      supplierConnectionId: scope === "SUPPLIER" ? scopeValue : null,
      startsAt,
      endsAt,
      maxUses: maxUses === null ? null : Math.floor(maxUses),
      active,
    },
  };
}

export async function createPromoAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = await parsePromo(formData);
  if (!data) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }
  await prisma.promo.create({ data });
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
  redirect("/admin/promos?created=1");
}

export async function updatePromoAction(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = await parsePromo(formData, id);
  if (!data) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }
  await prisma.promo.update({ where: { id }, data });
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
  redirect("/admin/promos?saved=1");
}

export async function togglePromoAction(id: string): Promise<void> {
  await requireAdmin();
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) return;
  await prisma.promo.update({
    where: { id },
    data: { active: !promo.active },
  });
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
}

export async function deletePromoAction(id: string): Promise<void> {
  await requireAdmin();
  const promo = await prisma.promo.findUnique({ where: { id } });
  if (!promo) return;
  if (promo.usedCount > 0) {
    await prisma.promo.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.promo.delete({ where: { id } });
  }
  revalidatePath("/admin/promos");
  revalidatePath("/promos");
}
