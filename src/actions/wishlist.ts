"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireUser } from "@/lib/auth";

export type WishlistToggleResult = {
  saved: boolean;
  requiresAuth?: boolean;
};

export async function toggleWishlistAction(
  productId: string,
): Promise<WishlistToggleResult> {
  const user = await getCurrentUser();
  if (!user) return { saved: false, requiresAuth: true };

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/account/wishlist");
    revalidatePath("/account");
    return { saved: false };
  }

  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  revalidatePath("/account/wishlist");
  revalidatePath("/account");
  return { saved: true };
}

export async function removeWishlistItemAction(productId: string): Promise<void> {
  const user = await requireUser("/account/wishlist");
  await prisma.wishlistItem.deleteMany({
    where: { userId: user.id, productId },
  });
  revalidatePath("/account/wishlist");
  revalidatePath("/account");
}
