"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { ORDER_STATUSES } from "@/lib/constants";
import { text, type FormState } from "@/lib/form";

const PAYMENT_STATUSES = ["unpaid", "paid", "refunded", "failed"];
const FULFILMENT_STATUSES = ["PENDING", "ORDERED", "IN_TRANSIT", "RECEIVED", "PACKED", "SHIPPED"];

export async function updateOrderAction(
  id: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return { status: "error", message: "That order no longer exists." };

  const status = text(formData, "status");
  const paymentStatus = text(formData, "paymentStatus");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { status: "error", message: "Choose a valid order status." };
  }
  if (!PAYMENT_STATUSES.includes(paymentStatus)) {
    return { status: "error", message: "Choose a valid payment status." };
  }

  await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      courier: text(formData, "courier") || null,
      trackingNumber: text(formData, "trackingNumber") || null,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${order.number}`);
  return { status: "success", message: "Order updated." };
}

export async function updateItemFulfilmentAction(
  itemId: string,
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();
  const item = await prisma.orderItem.findUnique({ where: { id: itemId } });
  if (!item) return { status: "error", message: "That line no longer exists." };

  const status = text(formData, "fulfilmentStatus");
  if (!FULFILMENT_STATUSES.includes(status)) {
    return { status: "error", message: "Choose a valid fulfilment status." };
  }

  await prisma.orderItem.update({
    where: { id: itemId },
    data: {
      fulfilmentStatus: status,
      supplierOrderRef: text(formData, "supplierOrderRef") || null,
    },
  });

  revalidatePath(`/admin/orders/${item.orderId}`);
  return { status: "success", message: "Supplier line updated." };
}

export async function cancelOrderAction(id: string): Promise<void> {
  await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order || order.status === "CANCELLED") return;

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      if (!item.productId) continue;
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    if (order.discountCode) {
      const promo = await tx.promo.findUnique({
        where: { code: order.discountCode },
      });
      if (promo && promo.usedCount > 0) {
        await tx.promo.update({
          where: { id: promo.id },
          data: { usedCount: { decrement: 1 } },
        });
      }
    }
    await tx.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${order.number}`);
  redirect(`/admin/orders/${id}`);
}
