"use server";

import { prisma } from "@/lib/prisma";
import { parseCartPayload, resolveCart } from "@/lib/cart-server";
import { evaluatePromo } from "@/lib/promos";

export type PromoCheck = {
  ok: boolean;
  message: string;
  code?: string;
  label?: string;
  discount?: number;
  freeShipping?: boolean;
  subtotal?: number;
  shipping?: number;
  total?: number;
};

export async function checkPromoAction(
  rawCode: string,
  rawCart: string,
): Promise<PromoCheck> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, message: "Enter a promo code." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawCart);
  } catch {
    return { ok: false, message: "Your bag could not be read. Refresh and try again." };
  }

  const cart = await resolveCart(parseCartPayload(parsed));
  if (cart.lines.length === 0) {
    return { ok: false, message: "Add something to your bag first." };
  }
  if (cart.issues.length > 0) {
    return { ok: false, message: cart.issues[0] };
  }

  const promo = await prisma.promo.findUnique({ where: { code } });
  if (!promo) {
    return { ok: false, message: "That code is not recognised." };
  }

  const result = evaluatePromo(promo, cart.lines, cart.subtotal, cart.shipping);
  if (!result.ok) {
    return { ok: false, message: result.message };
  }

  const shipping = result.freeShipping ? 0 : cart.shipping;
  return {
    ok: true,
    message: `${promo.code} applied — ${promo.label}.`,
    code: promo.code,
    label: promo.label,
    discount: result.discount,
    freeShipping: result.freeShipping,
    subtotal: cart.subtotal,
    shipping,
    total: Math.max(0, cart.subtotal - result.discount + shipping),
  };
}
