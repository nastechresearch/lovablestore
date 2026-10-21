import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function orderExists(number: string): Promise<boolean> {
  const order = await prisma.order.findUnique({
    where: { number },
    select: { id: true },
  });
  return Boolean(order);
}

export async function findAuthorisedOrder(number: string, key?: string | null) {
  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: {
        include: {
          product: {
            select: {
              leadTimeMin: true,
              leadTimeMax: true,
              supplierConnection: { select: { kind: true } },
            },
          },
        },
      },
      user: { select: { id: true, accountId: true } },
    },
  });
  if (!order) return null;

  const viewer = await getCurrentUser();
  if (viewer && order.userId === viewer.id) return order;

  const supplied = key?.trim();
  if (!supplied) return null;

  if (supplied.toLowerCase() === order.email.toLowerCase()) return order;
  if (
    order.user?.accountId &&
    supplied.toUpperCase() === order.user.accountId.toUpperCase()
  ) {
    return order;
  }

  return null;
}
