import type { Prisma } from "@prisma/client";

export type Review = {
  name: string;
  rating: number;
  title: string;
  text: string;
  date: string;
};

export const productInclude = {
  tags: { orderBy: { name: "asc" } },
  supplierConnection: true,
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export type StoreTag = {
  name: string;
  slug: string;
  kind: string;
};

export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  price: number;
  compareAtPrice: number | null;
  category: string;
  recipient: string;
  occasion: string;
  tags: string[];
  tagDetails: StoreTag[];
  badge: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  sku: string;
  barcode: string | null;
  status: string;
  supplier: string | null;
  supplierConnectionId: string | null;
  supplierKind: string;
  supplierProductId: string | null;
  supplierUrl: string | null;
  supplierPrice: number | null;
  supplierCurrency: string;
  shipsFrom: string;
  leadTimeMin: number;
  leadTimeMax: number;
  promoLabel: string | null;
  promoEndsAt: string | null;
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
};

export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseImages(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string => typeof item === "string" && item.length > 0,
      );
    }
  } catch {
    // Older records may hold a plain URL; fall through.
  }
  return value ? [value] : [];
}

export function parseReviews(value: string): Review[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as Review[]) : [];
  } catch {
    return [];
  }
}

export function autoImagePath(slug: string): string {
  return `/api/product-image/${slug}`;
}

export function needsPlainImage(src: string): boolean {
  return src.startsWith("/api/product-image") || src.endsWith(".svg");
}

export function imageFor(
  product: Pick<StoreProduct, "images" | "slug">,
  index = 0,
): string {
  return product.images[index] || autoImagePath(product.slug);
}

export function isLocalProduct(product: Pick<StoreProduct, "supplierKind">): boolean {
  return product.supplierKind === "LOCAL";
}

export function deliveryLabel(product: Pick<StoreProduct, "leadTimeMin" | "leadTimeMax">): string {
  if (product.leadTimeMin === product.leadTimeMax) {
    return `${product.leadTimeMin} days`;
  }
  return `${product.leadTimeMin}–${product.leadTimeMax} days`;
}

export function toStoreProduct(product: ProductWithRelations): StoreProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    tagline: product.tagline,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    recipient: product.recipient,
    occasion: product.occasion,
    tags: product.tags.map((tag) => tag.name),
    tagDetails: product.tags.map((tag) => ({
      name: tag.name,
      slug: tag.slug,
      kind: tag.kind,
    })),
    badge: product.badge,
    images: parseImages(product.images),
    sizes: parseList(product.sizes),
    colors: parseList(product.colors),
    stock: product.stock,
    sku: product.sku,
    barcode: product.barcode,
    status: product.status,
    supplier: product.supplier,
    supplierConnectionId: product.supplierConnectionId,
    supplierKind: product.supplierConnection?.kind ?? "LOCAL",
    supplierProductId: product.supplierProductId,
    supplierUrl: product.supplierUrl,
    supplierPrice: product.supplierPrice,
    supplierCurrency: product.supplierCurrency,
    shipsFrom: product.shipsFrom,
    leadTimeMin: product.leadTimeMin,
    leadTimeMax: product.leadTimeMax,
    promoLabel: product.promoLabel,
    promoEndsAt: product.promoEndsAt?.toISOString() ?? null,
    featured: product.featured,
    rating: product.rating,
    reviewCount: product.reviewCount,
    createdAt: product.createdAt.toISOString(),
  };
}
