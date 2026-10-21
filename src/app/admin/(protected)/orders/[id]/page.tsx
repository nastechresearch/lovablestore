import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Gift, Mail, PackageCheck, Phone, MapPin, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate, formatZAR } from "@/lib/format";
import { needsPlainImage } from "@/lib/products";
import { AdminHeading, StatusBadge } from "@/components/admin/admin-ui";
import { CancelOrderButton, FulfilmentForm, OrderStatusForm } from "@/components/admin/order-forms";
import {
  updateItemFulfilmentAction,
  updateOrderAction,
  cancelOrderAction,
} from "@/actions/admin-orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) notFound();

  const margin = order.total - order.supplierCost;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
      >
        <ArrowLeft className="size-3" aria-hidden />
        All orders
      </Link>

      <AdminHeading
        eyebrow={`Placed ${formatDate(order.createdAt)}`}
        title={order.number}
        description={`${itemCount} ${itemCount === 1 ? "item" : "items"} · ${order.paymentProvider === "demo" ? "Demo payment" : order.paymentProvider ?? "Payment provider pending"}`}
        action={
          <>
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.status} />
            <Link
              href={`/order/${order.number}?email=${encodeURIComponent(order.email)}`}
              className="btn-outline min-h-10 gap-1.5 px-4 text-[9px]"
              target="_blank"
            >
              Customer view
              <ExternalLink className="size-3" aria-hidden />
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-6">
          <section className="border border-line bg-cream">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-2xl">Items &amp; fulfilment</h2>
              <span className="text-[9px] uppercase tracking-[0.12em] text-stone">
                Supplier refs are internal
              </span>
            </div>
            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="px-5 py-4">
                  <div className="flex gap-4">
                    <div className="relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-ivory-deep">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized={needsPlainImage(item.image)}
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-xl leading-tight">{item.name}</p>
                          <p className="mt-1 text-[9.5px] uppercase tracking-[0.12em] text-stone">
                            {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
                            {item.sku ? ` · ${item.sku}` : ""}
                          </p>
                          {item.supplierName ? (
                            <p className="mt-1 text-[10px] text-stone">
                              Supplier · {item.supplierName}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{formatZAR(item.price * item.quantity)}</p>
                          <StatusBadge status={item.fulfilmentStatus} />
                        </div>
                      </div>
                      <FulfilmentForm
                        action={updateItemFulfilmentAction.bind(null, item.id)}
                        item={item}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Order status</h2>
            <p className="mt-1 text-[11px] text-stone">
              Marking an order paid here does not take payment — record it only
              after confirming in PayFast or your bank.
            </p>
            <div className="mt-5">
              <OrderStatusForm
                action={updateOrderAction.bind(null, order.id)}
                order={order}
              />
            </div>
          </section>

          {order.giftNote ? (
            <section className="border border-champagne-dark/30 bg-champagne/10 p-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <Gift className="size-4 text-champagne-dark" aria-hidden />
                Gift note
              </h2>
              <p className="mt-2 font-display text-lg italic text-ink-soft">“{order.giftNote}”</p>
            </section>
          ) : null}

          {order.notes ? (
            <section className="border border-line bg-cream p-5">
              <h2 className="font-display text-xl">Delivery notes</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-stone">{order.notes}</p>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Documents</h2>
            <p className="mt-1 text-[10px] leading-relaxed text-stone">
              Print-ready paperwork using your saved store details.
            </p>
            <div className="mt-4 space-y-2">
              <Link
                href={`/admin/orders/${order.id}/invoice`}
                target="_blank"
                className="flex items-center justify-between gap-3 border border-line px-3 py-2.5 text-[11px] transition-colors hover:border-oxblood/40 hover:bg-ivory"
              >
                <span className="flex items-center gap-2">
                  <FileText className="size-3.5 text-champagne-dark" aria-hidden />
                  Tax invoice
                </span>
                <ExternalLink className="size-3 text-stone" aria-hidden />
              </Link>
              <Link
                href={`/admin/orders/${order.id}/packing-slip`}
                target="_blank"
                className="flex items-center justify-between gap-3 border border-line px-3 py-2.5 text-[11px] transition-colors hover:border-oxblood/40 hover:bg-ivory"
              >
                <span className="flex items-center gap-2">
                  <PackageCheck className="size-3.5 text-champagne-dark" aria-hidden />
                  Packing slip
                </span>
                <ExternalLink className="size-3 text-stone" aria-hidden />
              </Link>
              <Link
                href={`/admin/orders/${order.id}/label`}
                target="_blank"
                className="flex items-center justify-between gap-3 border border-line px-3 py-2.5 text-[11px] transition-colors hover:border-oxblood/40 hover:bg-ivory"
              >
                <span className="flex items-center gap-2">
                  <Tag className="size-3.5 text-champagne-dark" aria-hidden />
                  Courier label
                </span>
                <ExternalLink className="size-3 text-stone" aria-hidden />
              </Link>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Summary</h2>
            <dl className="mt-4 space-y-2 text-[12px]">
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Subtotal</dt>
                <dd>{formatZAR(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between gap-3 text-oxblood">
                  <dt>Discount {order.discountCode ? `(${order.discountCode})` : ""}</dt>
                  <dd>−{formatZAR(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Delivery</dt>
                <dd>{order.shipping === 0 ? "Complimentary" : formatZAR(order.shipping)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2 font-medium">
                <dt>Order total</dt>
                <dd>{formatZAR(order.total)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Supplier cost</dt>
                <dd>{formatZAR(order.supplierCost)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-stone">Estimated margin</dt>
                <dd className={margin >= 0 ? "text-champagne-dark" : "text-oxblood"}>
                  {formatZAR(margin)}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-[9px] text-stone">
              Provider: {order.paymentProvider ?? "—"}
              {order.paymentRef ? ` · Ref ${order.paymentRef}` : ""}
            </p>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <MapPin className="size-4 text-champagne-dark" aria-hidden />
              Customer
            </h2>
            <div className="mt-3 space-y-1 text-[12px] text-stone">
              <p className="font-medium text-ink">{order.firstName} {order.lastName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.province}, {order.postalCode}</p>
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-[11px]">
              <a href={`mailto:${order.email}`} className="flex items-center gap-2 hover:text-oxblood">
                <Mail className="size-3.5" aria-hidden />
                {order.email}
              </a>
              <a href={`tel:${order.phone}`} className="flex items-center gap-2 hover:text-oxblood">
                <Phone className="size-3.5" aria-hidden />
                {order.phone}
              </a>
            </div>
          </section>

          {order.status !== "CANCELLED" ? (
            <section className="border border-oxblood/25 bg-oxblood/5 p-5">
              <h2 className="font-display text-xl text-oxblood">Danger zone</h2>
              <p className="mt-1 text-[10px] leading-relaxed text-stone">
                Cancelling restocks every item and releases the promo use. This
                cannot be undone.
              </p>
              <div className="mt-4">
                <CancelOrderButton action={cancelOrderAction.bind(null, order.id)} />
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
