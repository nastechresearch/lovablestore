import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to download your data." }, { status: 401 });
  }

  const [orders, wishlist, reviews, support] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: { product: { select: { name: true, slug: true, sku: true } } },
    }),
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supportConversation.findMany({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    store: "Lovable Store",
    account: {
      accountId: user.accountId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      defaultAddress: user.defaultAddress,
      defaultCity: user.defaultCity,
      defaultProvince: user.defaultProvince,
      defaultPostalCode: user.defaultPostalCode,
      marketingEmail: user.marketingEmail,
      marketingWhatsapp: user.marketingWhatsapp,
      createdAt: user.createdAt,
    },
    orders,
    wishlist,
    reviews,
    support,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="lovable-store-${user.accountId ?? user.id}.json"`,
      "cache-control": "no-store",
    },
  });
}
