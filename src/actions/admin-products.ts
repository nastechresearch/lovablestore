"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { generateEan13, generateSku, slugify } from "@/lib/ids";
import { centsFromRands, checkbox, text, type FormState } from "@/lib/form";

const CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];
const RECIPIENTS = ["For Her", "For Him", "For Couples", "For Everyone"];
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];

function safeImages(value: string): string[] {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.startsWith("/") ||
        item.startsWith("http://") ||
        item.startsWith("https://"),
    );
}

async function uniqueSlug(name: string, ignoreId?: string): Promise<string> {
  const base = slugify(name) || `product-${Date.now()}`;
  let slug = base;
  let suffix = 2;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

async function tagIdsFromInput(value: string) {
  const names = [...new Set(value.split(",").map((name) => name.trim()).filter(Boolean))];
  const ids: { id: string }[] = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug, kind: "STYLE" },
    });
    ids.push({ id: tag.id });
  }
  return ids;
}

type ProductInput = {
  name: string;
  slug: string;
  tagline: string | null;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  recipient: string;
  occasion: string;
  badge: string | null;
  images: string;
  sizes: string;
  colors: string;
  stock: number;
  sku: string;
  barcode: string | null;
  supplier: string | null;
  supplierCost: number;
  supplierConnectionId: string | null;
  supplierProductId: string | null;
  supplierSku: string | null;
  supplierUrl: string | null;
  supplierCurrency: string;
  shipsFrom: string;
  leadTimeMin: number;
  leadTimeMax: number;
  promoLabel: string | null;
  promoEndsAt: Date | null;
  status: string;
  featured: boolean;
  tagIds: { id: string }[];
};

async function parseProduct(
  formData: FormData,
  ignoreId?: string,
): Promise<{ errors: Record<string, string>; data?: ProductInput }> {
  const errors: Record<string, string> = {};
  const name = text(formData, "name");
  const description = text(formData, "description");
  const category = text(formData, "category");
  const recipient = text(formData, "recipient");
  const occasion = text(formData, "occasion") || "Everyday";
  const price = centsFromRands(text(formData, "price"));
  const compareAtPrice = centsFromRands(text(formData, "compareAtPrice"));
  const stockValue = Number(text(formData, "stock") || "0");
  const status = text(formData, "status") || "ACTIVE";
  const supplierCost = centsFromRands(text(formData, "supplierCost")) ?? 0;
  const supplierConnectionId = text(formData, "supplierConnectionId") || null;
  const leadTimeMin = Number(text(formData, "leadTimeMin") || "2");
  const leadTimeMax = Number(text(formData, "leadTimeMax") || "5");
  const promoEndsRaw = text(formData, "promoEndsAt");
  const tagIds = await tagIdsFromInput(text(formData, "tags"));

  if (name.length < 2) errors.name = "Give the product a name.";
  if (description.length < 20) errors.description = "Write at least a sentence of description.";
  if (!CATEGORIES.includes(category)) errors.category = "Choose a category.";
  if (!RECIPIENTS.includes(recipient)) errors.recipient = "Choose a recipient.";
  if (price === null || price <= 0) errors.price = "Enter a selling price in rand.";
  if (!STATUSES.includes(status)) errors.status = "Choose a valid status.";
  if (!Number.isFinite(stockValue) || stockValue < 0) errors.stock = "Stock must be zero or more.";
  if (!Number.isFinite(leadTimeMin) || leadTimeMin < 0) errors.leadTimeMin = "Enter valid lead days.";
  if (!Number.isFinite(leadTimeMax) || leadTimeMax < leadTimeMin) {
    errors.leadTimeMax = "The maximum must be at least the minimum.";
  }
  if (tagIds.length === 0) errors.tags = "Add at least one tag.";

  if (Object.keys(errors).length > 0) return { errors };
  if (price === null) return { errors };

  const connection = supplierConnectionId
    ? await prisma.supplierConnection.findUnique({ where: { id: supplierConnectionId } })
    : null;
  if (supplierConnectionId && !connection) {
    errors.supplierConnectionId = "That supplier connection no longer exists.";
    return { errors };
  }

  const sku = text(formData, "sku") || generateSku(category);
  const duplicateSku = await prisma.product.findUnique({ where: { sku } });
  if (duplicateSku && duplicateSku.id !== ignoreId) {
    errors.sku = "That SKU is already in use.";
    return { errors };
  }

  return {
    errors,
    data: {
      name,
      slug: await uniqueSlug(name, ignoreId),
      tagline: text(formData, "tagline") || null,
      description,
      price,
      compareAtPrice,
      category,
      recipient,
      occasion,
      badge: text(formData, "badge") || null,
      images: JSON.stringify(safeImages(text(formData, "images"))),
      sizes: text(formData, "sizes"),
      colors: text(formData, "colors"),
      stock: Math.floor(stockValue),
      sku,
      barcode: text(formData, "barcode") || generateEan13(),
      supplier: connection?.name || text(formData, "supplier") || null,
      supplierCost,
      supplierConnectionId,
      supplierProductId: text(formData, "supplierProductId") || null,
      supplierSku: text(formData, "supplierSku") || null,
      supplierUrl: text(formData, "supplierUrl") || null,
      supplierCurrency: text(formData, "supplierCurrency") || connection?.defaultCurrency || "ZAR",
      shipsFrom: text(formData, "shipsFrom") || connection?.defaultShipsFrom || "South Africa",
      leadTimeMin: Math.floor(leadTimeMin),
      leadTimeMax: Math.floor(leadTimeMax),
      promoLabel: text(formData, "promoLabel") || null,
      promoEndsAt: promoEndsRaw ? new Date(promoEndsRaw) : null,
      status,
      featured: checkbox(formData, "featured"),
      tagIds,
    },
  };
}

function revalidateProductPaths() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

export async function createProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = await parseProduct(formData);
  if (!data) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const { tagIds, ...productData } = data;
  const product = await prisma.product.create({
    data: {
      ...productData,
      tags: { connect: tagIds },
    },
  });

  revalidateProductPaths();
  redirect(`/admin/products/${product.id}?saved=1`);
}

export async function updateProductAction(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const { errors, data } = await parseProduct(formData, id);
  if (!data) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const { tagIds, ...productData } = data;
  await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      tags: { set: tagIds },
    },
  });

  revalidateProductPaths();
  revalidatePath(`/product/${data.slug}`);
  redirect(`/admin/products/${id}?saved=1`);
}

export async function setProductStatusAction(id: string, status: string): Promise<void> {
  await requireAdmin();
  if (!STATUSES.includes(status)) return;
  await prisma.product.update({ where: { id }, data: { status } });
  revalidateProductPaths();
}

export async function deleteProductAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidateProductPaths();
  redirect("/admin/products");
}
