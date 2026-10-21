import { prisma } from "@/lib/prisma";

export async function recalculateProductRating(productId: string): Promise<void> {
  const aggregate = await prisma.review.aggregate({
    where: { productId, status: "APPROVED" },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const count = aggregate._count._all;
  if (count === 0) return;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round((aggregate._avg.rating ?? 0) * 10) / 10,
      reviewCount: count,
    },
  });
}
