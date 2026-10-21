import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, ReceiptText, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatDate, formatZAR } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/constants";
import { needsPlainImage } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your orders",
  robots: { index: false, follow: false },
};

export default async function AccountOrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const lifetime = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-champagne-dark">Order history</p>
          <h1 className="mt-1 font-display text-3xl">Your orders.</h1>
          <p className="mt-1 text-[11px] text-stone">
            Every order placed with {user.email}, newest first.
          </p>
        </div>
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 border border-line bg-cream px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
        >
          <Truck className="size-3.5" aria-hidden />
          Track a parcel
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
          <div className="border border-line bg-cream px-4 py-3">
            <p className="text-[9px] uppercase tracking-[0.14em] text-stone">Orders placed</p>
            <p className="mt-1 font-display text-2xl leading-none">{orders.length}</p>
          </div>
          <div className="border border-line bg-cream px-4 py-3">
            <p className="text-[9px] uppercase tracking-[0.14em] text-stone">Paid to date</p>
            <p className="mt-1 font-display text-2xl leading-none">{formatZAR(lifetime)}</p>
          </div>
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-cream p-10 text-center">
          <Package className="mx-auto size-8 text-stone" aria-hidden />
          <p className="mt-4 font-display text-2xl">Nothing here yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-stone">
            Orders placed while signed in are kept here. Guest orders can still be viewed with
            the order number and email.
          </p>
          <Link href="/shop" className="btn-primary mt-5">
            Shop the edit
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const tracking = order.trackingNumber
              ? `${order.courier ? `${order.courier} · ` : ""}${order.trackingNumber}`
              : null;
            return (
              <li key={order.id} className="border border-line bg-cream">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ivory-deep/25 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.1em]">
                    <span className="font-medium text-ink">{order.number}</span>
                    <span className="text-stone">{formatDate(order.createdAt)}</span>
                    <span className="border border-line bg-cream px-1.5 py-0.5 text-[8.5px] text-stone">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <span className="font-display text-lg">{formatZAR(order.total)}</span>
                </div>

                <div className="divide-y divide-line/70 px-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <span className="relative size-14 shrink-0 overflow-hidden border border-line bg-ivory-deep">
                        <Image
                          src={item.image || "/images/editorial/hero-gifts.jpg"}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized={needsPlainImage(item.image)}
                          className="object-cover"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] text-ink">{item.name}</p>
                        <p className="mt-0.5 text-[9.5px] text-stone">
                          Qty {item.quantity}
                          {item.size ? ` · Size ${item.size}` : ""}
                          {item.sku ? ` · ${item.sku}` : ""}
                        </p>
                      </div>
                      <span className="text-[10px] text-stone">
                        {formatZAR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                  <div className="text-[9.5px] leading-relaxed text-stone">
                    {tracking ? (
                      <span className="inline-flex items-center gap-1.5">
                        <Truck className="size-3.5 text-oxblood" aria-hidden />
                        {tracking}
                      </span>
                    ) : (
                      <span>
                        Shipping to {order.city}, {order.province}
                        {order.paymentStatus === "paid" ? " · Payment received" : " · Payment pending"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={`/order/${order.number}/invoice?email=${encodeURIComponent(order.email)}`}
                      className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-stone transition-colors hover:text-oxblood"
                    >
                      <ReceiptText className="size-3.5" aria-hidden />
                      Invoice
                    </Link>
                    <Link
                      href={`/order/${order.number}?email=${encodeURIComponent(order.email)}`}
                      className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-oxblood transition-colors hover:text-ink"
                    >
                      View order
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
