import type { Prisma, Promo } from "@prisma/client";

export type PromoLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  tagSlugs: string[];
  supplierConnectionId: string | null;
  supplierKind: string;
};

export type PromoSuccess = {
  ok: true;
  promo: Promo;
  discount: number;
  freeShipping: boolean;
  eligibleSubtotal: number;
};

export type PromoFailure = {
  ok: false;
  message: string;
};

export type PromoResult = PromoSuccess | PromoFailure;

export function promoIsLive(
  promo: Pick<Promo, "active" | "startsAt" | "endsAt" | "maxUses" | "usedCount">,
  now = new Date(),
): boolean {
  if (!promo.active) return false;
  if (promo.startsAt && promo.startsAt > now) return false;
  if (promo.endsAt && promo.endsAt < now) return false;
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return false;
  return true;
}

function matchesScope(promo: Promo, line: PromoLine): boolean {
  switch (promo.scope) {
    case "CATEGORY":
      return line.category === promo.scopeValue;
    case "TAG":
      return Boolean(promo.scopeValue && line.tagSlugs.includes(promo.scopeValue));
    case "PRODUCT":
      return (
        promo.scopeValue === line.productId || promo.scopeValue === line.slug
      );
    case "SUPPLIER":
      return Boolean(
        promo.scopeValue && line.supplierConnectionId === promo.scopeValue,
      );
    case "SUPPLIER_KIND":
      return Boolean(promo.scopeValue && line.supplierKind === promo.scopeValue);
    case "ALL":
    default:
      return true;
  }
}

export function evaluatePromo(
  promo: Promo,
  lines: PromoLine[],
  subtotal: number,
  shipping: number,
  now = new Date(),
): PromoResult {
  if (!promoIsLive(promo, now)) {
    return { ok: false, message: "This code is no longer available." };
  }
  if (subtotal < promo.minSubtotal) {
    return {
      ok: false,
      message: `Spend R${Math.ceil(promo.minSubtotal / 100).toLocaleString("en-ZA")} or more to use ${promo.code}.`,
    };
  }

  const eligibleSubtotal = lines
    .filter((line) => matchesScope(promo, line))
    .reduce((total, line) => total + line.price * line.quantity, 0);

  if (eligibleSubtotal <= 0) {
    return {
      ok: false,
      message: "This code does not apply to the items in your bag.",
    };
  }

  if (promo.type === "FREE_SHIPPING") {
    return {
      ok: true,
      promo,
      discount: 0,
      freeShipping: true,
      eligibleSubtotal,
    };
  }

  const raw =
    promo.type === "PERCENT"
      ? Math.round((eligibleSubtotal * promo.value) / 100)
      : promo.value;

  const discount = Math.max(0, Math.min(raw, eligibleSubtotal, subtotal - 0));

  if (discount <= 0) {
    return { ok: false, message: "There is nothing to discount in this order." };
  }

  return {
    ok: true,
    promo,
    discount,
    freeShipping: false,
    eligibleSubtotal,
  };
}

export function promoPublicInclude(): Prisma.PromoInclude {
  return { supplierConnection: true };
}

export function formatPromoValue(
  promo: Pick<Promo, "type" | "value" | "label">,
): string {
  if (promo.type === "PERCENT") return `${promo.value}% off`;
  if (promo.type === "FIXED") return `R${(promo.value / 100).toLocaleString("en-ZA")} off`;
  return "Free delivery";
}
