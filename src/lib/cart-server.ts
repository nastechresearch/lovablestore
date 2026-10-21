import { prisma } from "@/lib/prisma";
import { productInclude, parseList, imageFor, toStoreProduct } from "@/lib/products";
import { shippingForSubtotal } from "@/lib/format";
import type { PromoLine } from "@/lib/promos";

export type CartInput = {
  productId: string;
  quantity: number;
  size?: string;
};

export type ResolvedCartLine = PromoLine & {
  size: string | null;
  image: string;
  stock: number;
  supplierName: string | null;
  supplierCost: number;
  sku: string;
};

export type ResolvedCart = {
  lines: ResolvedCartLine[];
  subtotal: number;
  shipping: number;
  issues: string[];
};

export async function resolveCart(items: CartInput[]): Promise<ResolvedCart> {
  const ids = [...new Set(items.map((item) => item.productId))].filter(Boolean);
  const products = ids.length
    ? await prisma.product.findMany({
        where: { id: { in: ids } },
        include: productInclude,
      })
    : [];
  const byId = new Map(products.map((product) => [product.id, product]));

  const lines: ResolvedCartLine[] = [];
  const issues: string[] = [];

  for (const item of items) {
    const raw = byId.get(item.productId);
    const quantity = Math.max(0, Math.min(20, Math.floor(item.quantity)));
    if (!raw) {
      issues.push("One of the items in your bag is no longer available.");
      continue;
    }
    const product = toStoreProduct(raw);
    if (product.status !== "ACTIVE") {
      issues.push(`${product.name} is no longer available.`);
      continue;
    }
    if (quantity < 1) continue;
    if (product.stock < quantity) {
      issues.push(
        product.stock === 0
          ? `${product.name} has just sold out.`
          : `Only ${product.stock} × ${product.name} left in stock.`,
      );
      continue;
    }
    if (product.sizes.length > 0) {
      if (!item.size || !product.sizes.includes(item.size)) {
        issues.push(`Choose a valid option for ${product.name}.`);
        continue;
      }
    }

    lines.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity,
      size: product.sizes.length ? item.size || null : null,
      image: imageFor(product),
      stock: product.stock,
      sku: product.sku,
      category: product.category,
      tagSlugs: product.tagDetails.map((tag) => tag.slug),
      supplierConnectionId: product.supplierConnectionId,
      supplierKind: product.supplierKind,
      supplierName: product.supplier,
      supplierCost: raw.supplierCost,
    });
  }

  const subtotal = lines.reduce(
    (sum, line) => sum + line.price * line.quantity,
    0,
  );

  return {
    lines,
    subtotal,
    shipping: shippingForSubtotal(subtotal),
    issues,
  };
}

export function parseCartPayload(value: unknown): CartInput[] {
  if (!Array.isArray(value)) return [];
  const items: CartInput[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const productId = typeof record.productId === "string" ? record.productId : "";
    const quantity = Number(record.quantity);
    const size = typeof record.size === "string" ? record.size : undefined;
    if (!productId || !Number.isFinite(quantity)) continue;
    items.push({ productId, quantity, size });
  }
  return items;
}

export function cartFromForm(formData: FormData): CartInput[] {
  const raw = formData.get("cart");
  if (typeof raw !== "string") return [];
  try {
    return parseCartPayload(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function promoLinesFromCart(cart: ResolvedCart): PromoLine[] {
  return cart.lines;
}

export function sizeOptions(sizes: string): string[] {
  return parseList(sizes);
}
