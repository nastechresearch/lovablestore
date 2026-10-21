import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ signedIn: false, ids: [] });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json({
    signedIn: true,
    ids: items.map((item) => item.productId),
  });
}
