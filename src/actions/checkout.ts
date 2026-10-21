"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PROVINCES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, minutesLabel, rateLimit } from "@/lib/rate-limit";
import { cartFromForm, resolveCart } from "@/lib/cart-server";
import { evaluatePromo } from "@/lib/promos";
import { formatZAR } from "@/lib/format";
import { orderNumber } from "@/lib/ids";
import {
  buildPayfastFields,
  isDemoCheckout,
  payfastProcessUrl,
} from "@/lib/payfast";
import { text } from "@/lib/form";

export type CheckoutState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors?: Record<string, string>;
  payfast?: {
    url: string;
    fields: Record<string, string>;
  };
};

const checkoutSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name."),
  lastName: z.string().trim().min(2, "Enter your last name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/[^0-9+]/g, ""))
    .refine((value) => /^(\+27|0)[6-8][0-9]{8}$/.test(value), {
      message: "Use a valid South African mobile number.",
    }),
  address: z.string().trim().min(6, "Enter your street address."),
  city: z.string().trim().min(2, "Enter your city or suburb."),
  province: z.enum(PROVINCES, { message: "Choose your province." }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "South African postal codes have four digits."),
  giftNote: z.string().trim().max(300, "Keep the gift note under 300 characters.").optional(),
  notes: z.string().trim().max(500, "Keep delivery notes under 500 characters.").optional(),
  promoCode: z.string().trim().max(40).optional(),
});

export async function placeOrderAction(
  _previous: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  const ip = await clientIp();
  const attempts = rateLimit(`checkout:${ip}`, 8, 15 * 60_000);
  if (!attempts.ok) {
    return {
      status: "error",
      message: `Too many checkout attempts from this connection. Try again in ${minutesLabel(attempts.retryAfterSeconds)}.`,
    };
  }

  const raw = {
    firstName: text(formData, "firstName"),
    lastName: text(formData, "lastName"),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone"),
    address: text(formData, "address"),
    city: text(formData, "city"),
    province: text(formData, "province"),
    postalCode: text(formData, "postalCode"),
    giftNote: text(formData, "giftNote"),
    notes: text(formData, "notes"),
    promoCode: text(formData, "promoCode").toUpperCase(),
  };

  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      message: "Check the highlighted details and try again.",
      fieldErrors,
    };
  }

  const cart = await resolveCart(cartFromForm(formData));
  if (cart.lines.length === 0) {
    return {
      status: "error",
      message:
        cart.issues[0] || "Your bag is empty. Add a gift before checking out.",
    };
  }
  if (cart.issues.length > 0) {
    return { status: "error", message: cart.issues[0] };
  }

  const recentOrders = await prisma.order.count({
    where: {
      email: raw.email.toLowerCase(),
      createdAt: { gte: new Date(Date.now() - 10 * 60_000) },
    },
  });
  if (recentOrders >= 3) {
    return {
      status: "error",
      message:
        "We have received several orders for this email in the last few minutes. Please wait a moment, or contact the studio so we can help.",
    };
  }

  let discount = 0;
  let shipping = cart.shipping;
  let promoId: string | null = null;
  let promoLabel: string | null = null;
  let discountCode: string | null = null;

  if (raw.promoCode) {
    const promo = await prisma.promo.findUnique({
      where: { code: raw.promoCode },
    });
    if (!promo) {
      return {
        status: "error",
        message: "That promo code is not recognised.",
        fieldErrors: { promoCode: "Code not found." },
      };
    }
    const result = evaluatePromo(promo, cart.lines, cart.subtotal, cart.shipping);
    if (!result.ok) {
      return {
        status: "error",
        message: result.message,
        fieldErrors: { promoCode: result.message },
      };
    }
    discount = result.discount;
    shipping = result.freeShipping ? 0 : cart.shipping;
    promoId = promo.id;
    promoLabel = promo.label;
    discountCode = promo.code;
  }

  const total = Math.max(0, cart.subtotal - discount + shipping);
  const demo = isDemoCheckout();
  let number = orderNumber();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const exists = await prisma.order.findUnique({ where: { number } });
    if (!exists) break;
    number = orderNumber();
  }

  const data = parsed.data;
  const supplierCost = cart.lines.reduce(
    (sum, line) => sum + line.supplierCost * line.quantity,
    0,
  );

  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const line of cart.lines) {
        const updated = await tx.product.updateMany({
          where: { id: line.productId, stock: { gte: line.quantity } },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(
            `${line.name} just sold out while you were checking out.`,
          );
        }
      }

      if (promoId) {
        await tx.promo.update({
          where: { id: promoId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return tx.order.create({
        data: {
          number,
          userId: user?.id ?? null,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode,
          giftNote: data.giftNote || null,
          notes: data.notes || null,
          subtotal: cart.subtotal,
          shipping,
          discount,
          total,
          supplierCost,
          discountCode,
          promoLabel,
          status: demo ? "PAID" : "PENDING",
          paymentStatus: demo ? "paid" : "unpaid",
          paymentProvider: demo ? "demo" : "payfast",
          paymentRef: demo ? `DEMO-${Date.now().toString(36).toUpperCase()}` : null,
          items: {
            create: cart.lines.map((line) => ({
              productId: line.productId,
              name: line.name,
              sku: line.sku,
              price: line.price,
              quantity: line.quantity,
              size: line.size,
              image: line.image,
              supplierName: line.supplierName,
              supplierConnectionId: line.supplierConnectionId,
            })),
          },
        },
        include: { items: true },
      });
    });

    if (demo) {
      redirect(
        `/order/${order.number}?email=${encodeURIComponent(order.email)}&new=1`,
      );
    }

    const fields = buildPayfastFields(order, order.items);
    return {
      status: "success",
      message: `Redirecting to PayFast for ${formatZAR(total)}.`,
      payfast: { url: payfastProcessUrl(), fields },
    };
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "We could not place that order. Please try again.",
    };
  }
}
