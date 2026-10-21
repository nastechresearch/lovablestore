import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Gift,
  Mail,
  MapPin,
  PackageCheck,
  ReceiptText,
  Truck,
} from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatZAR } from "@/lib/format";
import { needsPlainImage } from "@/lib/products";
import { findAuthorisedOrder, orderExists } from "@/lib/order-access";
import { getStoreSettings } from "@/lib/settings";
import { deliveryPlanForOrder } from "@/lib/order-delivery";
import { OrderTimeline } from "@/components/order/order-timeline";
import { DeliveryJourney } from "@/components/delivery/delivery-journey";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your order",
  robots: { index: false, follow: false },
};

type Params = Promise<{ number: string }>;
type SearchParams = Promise<{ email?: string; key?: string; new?: string }>;

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { number } = await params;
  const query = await searchParams;
  const order = await findAuthorisedOrder(number, query.key ?? query.email);
  if (!order && !(await orderExists(number))) {
    notFound();
  }

  if (!order) {
    return (
      <div className="container-lux flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-md border border-line bg-cream p-8">
          <p className="eyebrow text-champagne-dark">Order lookup</p>
          <h1 className="mt-3 font-display text-4xl leading-tight">
            Confirm it&apos;s you.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            For your privacy, enter the email or Lovable Store account ID used
            when order <span className="font-medium text-ink">{number}</span> was placed.
          </p>
          <form method="get" className="mt-6 space-y-3">
            <div>
              <label htmlFor="key" className="label">Email or account ID</label>
              <input
                id="key"
                name="key"
                required
                autoComplete="email"
                className="field"
                placeholder="you@example.co.za or LS-12345678"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              View order
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
          <p className="mt-4 text-center text-[10px] text-stone">
            Need help?{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-oxblood">
              Contact the studio
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const isNew = query.new === "1";
  const paid = order.paymentStatus === "paid";

  const settings = await getStoreSettings();
  const deliveryPlan = deliveryPlanForOrder(order, settings);

  return (
    <div className="container-lux py-10 sm:py-14">
      {isNew ? <ClearCartOnMount /> : null}

      <Reveal>
        <div className="border border-line bg-cream p-6 sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-champagne-dark">
                <CheckCircle2 className="size-4" aria-hidden />
                {paid ? "Order confirmed" : "Order received"}
              </p>
              <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.2rem)] leading-[0.95]">
                {isNew ? "It's wrapped and ready to go." : `Order ${order.number}`}
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone">
                Thank you, {order.firstName}.{" "}
                {paid
                  ? "Your payment is confirmed and our studio is preparing your order."
                  : "We're waiting for PayFast to confirm your payment. This page updates automatically when it clears."}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-stone">Order number</p>
              <p className="mt-1 font-display text-2xl">{order.number}</p>
              <p className="mt-1 text-[11px] text-stone">{formatDate(order.createdAt)}</p>
              <span
                className={`mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] ${
                  paid ? "bg-oxblood/10 text-oxblood" : "bg-champagne/20 text-champagne-dark"
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
          </div>

          {order.paymentProvider === "demo" ? (
            <p className="mt-6 border border-champagne-dark/40 bg-champagne/10 px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
              Demo checkout — this order was marked paid without taking real
              payment. Configure PayFast keys to take live payments.
            </p>
          ) : null}

          <div className="mt-8 border-t border-line pt-6">
            <OrderTimeline status={order.status} />
          </div>

          <div className="mt-6" data-print-hide>
            <DeliveryJourney plan={deliveryPlan} title="When it arrives" />
          </div>

          {order.trackingNumber ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-line bg-ivory px-4 py-3 text-[12px]">
              <span className="flex items-center gap-2">
                <Truck className="size-4 text-champagne-dark" aria-hidden />
                {order.courier ?? "Courier"} · {order.trackingNumber}
              </span>
              <Link
                href={`/track?number=${order.number}&email=${encodeURIComponent(order.email)}`}
                className="text-[10px] uppercase tracking-[0.14em] text-oxblood hover:underline"
              >
                Track order
              </Link>
            </div>
          ) : null}
        </div>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div>
          <h2 className="font-display text-3xl">In this order</h2>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-ivory-deep">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized={needsPlainImage(item.image)}
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xl leading-tight">{item.name}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-stone">
                      {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
                      {item.sku ? ` · ${item.sku}` : ""}
                    </p>
                    {item.fulfilmentStatus !== "PENDING" ? (
                      <p className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-champagne-dark">
                        <PackageCheck className="size-3" aria-hidden />
                        {item.fulfilmentStatus.toLowerCase()}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-sm font-medium">{formatZAR(item.price * item.quantity)}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              Continue shopping
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href={`/track?number=${order.number}&email=${encodeURIComponent(order.email)}`} className="btn-outline">
              Track this order
            </Link>
            <Link
              href={`/order/${order.number}/invoice?email=${encodeURIComponent(order.email)}`}
              className="btn-outline"
            >
              <ReceiptText className="size-4" aria-hidden />
              Tax invoice
            </Link>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="border border-line bg-cream p-6">
            <h2 className="font-display text-2xl">Summary</h2>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-stone">Subtotal</dt>
                <dd>{formatZAR(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between gap-4 text-oxblood">
                  <dt>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
                  <dd>−{formatZAR(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-stone">Delivery</dt>
                <dd>{order.shipping === 0 ? "Complimentary" : formatZAR(order.shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
                <dt className="text-[11px] uppercase tracking-[0.14em]">Total</dt>
                <dd className="font-display text-3xl">{formatZAR(order.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-stone">
              Payment · {order.paymentProvider === "demo" ? "Demo" : "PayFast"} · {order.paymentStatus}
            </p>
          </div>

          <div className="border border-line bg-cream p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl">
              <MapPin className="size-4 text-champagne-dark" aria-hidden />
              Delivering to
            </h2>
            <address className="mt-3 space-y-0.5 text-[13px] not-italic leading-relaxed text-stone">
              <p className="font-medium text-ink">{order.firstName} {order.lastName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.province}, {order.postalCode}</p>
              <p className="pt-2">{order.phone}</p>
              <p>{order.email}</p>
            </address>
            {order.notes ? (
              <p className="mt-3 border-t border-line pt-3 text-[11px] leading-relaxed text-stone">
                Delivery note: {order.notes}
              </p>
            ) : null}
          </div>

          {order.giftNote ? (
            <div className="border border-champagne/50 bg-champagne/10 p-6">
              <h2 className="flex items-center gap-2 font-display text-2xl">
                <Gift className="size-4 text-champagne-dark" aria-hidden />
                Your note
              </h2>
              <p className="mt-3 font-display text-lg italic leading-snug text-ink-soft">
                “{order.giftNote}”
              </p>
            </div>
          ) : null}

          <div className="border border-line p-6 text-[11px] leading-relaxed text-stone">
            <p className="flex items-center gap-2 font-medium uppercase tracking-[0.14em] text-ink-soft">
              <Mail className="size-3.5" aria-hidden />
              A copy is in your inbox
            </p>
            <p className="mt-2">
              We&apos;ve sent the confirmation to {order.email}. Add{" "}
              <span className="text-ink">hello@lovablestore.co.za</span> to your
              contacts so tracking updates don&apos;t land in spam.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
