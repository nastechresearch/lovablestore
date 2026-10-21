import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ReceiptText, Search, Truck } from "lucide-react";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatZAR } from "@/lib/format";
import { needsPlainImage } from "@/lib/products";
import { findAuthorisedOrder } from "@/lib/order-access";
import { getStoreSettings } from "@/lib/settings";
import { deliveryPlanForOrder } from "@/lib/order-delivery";
import { OrderTimeline } from "@/components/order/order-timeline";
import { DeliveryJourney } from "@/components/delivery/delivery-journey";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Follow your Lovable Store order from our studio to your door.",
};

type SearchParams = Promise<{ number?: string; key?: string; email?: string }>;

export default async function TrackPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const number = params.number?.trim().toUpperCase() ?? "";
  const key = params.key?.trim() ?? params.email?.trim() ?? "";

  const order = number ? await findAuthorisedOrder(number, key) : null;
  const searched = Boolean(number);
  const settings = order ? await getStoreSettings() : null;
  const deliveryPlan = order && settings ? deliveryPlanForOrder(order, settings) : null;

  return (
    <div className="container-lux py-10 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <p className="eyebrow text-champagne-dark">From our hands to theirs</p>
          <h1 className="mt-3 font-display text-[clamp(2.7rem,5.5vw,4.6rem)] leading-[0.95]">
            Track your <span className="italic text-oxblood">order</span>
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Enter your order number and the email or Lovable Store account ID
            used at checkout. Signed-in customers can open their own orders
            without a key.
          </p>

          <form method="get" className="mt-7 space-y-4 border border-line bg-cream p-5">
            <div>
              <label htmlFor="number" className="label">Order number</label>
              <input
                id="number"
                name="number"
                required
                defaultValue={number}
                placeholder="LS-261020-0001"
                className="field uppercase"
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="key" className="label">Email or account ID</label>
              <input
                id="key"
                name="key"
                required
                defaultValue={key}
                placeholder="you@example.co.za or LS-12345678"
                className="field"
                autoComplete="email"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <Search className="size-4" aria-hidden />
              Find my order
            </button>
          </form>

          {searched && !order ? (
            <p role="alert" className="mt-4 border border-oxblood/30 bg-oxblood/5 p-4 text-[12px] leading-relaxed text-oxblood">
              We couldn&apos;t match that order number and email/account ID.
              Check the confirmation email, or{" "}
              <Link href="/contact" className="underline underline-offset-2">
                contact the studio
              </Link>
              .
            </p>
          ) : null}

          <p className="mt-6 text-[10px] leading-relaxed text-stone">
            Courier updates can lag by a few hours. Local orders usually arrive
            within 2–5 working days; globally sourced pieces take 10–18.
          </p>
        </div>

        <div>
          {order ? (
            <div className="border border-line bg-cream p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.14em] text-stone">Order</p>
                  <p className="mt-1 font-display text-3xl">{order.number}</p>
                  <p className="mt-1 text-[11px] text-stone">
                    Placed {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="bg-oxblood/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-oxblood">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>

              <div className="mt-7 border-y border-line py-6">
                <OrderTimeline status={order.status} />
              </div>

              {deliveryPlan ? (
                <div className="mt-6">
                  <DeliveryJourney plan={deliveryPlan} title="Estimated arrival" />
                </div>
              ) : null}

              {order.trackingNumber ? (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-champagne-dark/40 bg-champagne/10 px-4 py-3 text-[12px]">
                  <span className="flex items-center gap-2">
                    <Truck className="size-4 text-champagne-dark" aria-hidden />
                    {order.courier ?? "Courier"} · {order.trackingNumber}
                  </span>
                </div>
              ) : (
                <p className="mt-6 text-[11px] leading-relaxed text-stone">
                  A tracking number appears here as soon as the courier scans
                  your parcel. We&apos;ll also SMS it to you.
                </p>
              )}

              <ul className="mt-6 divide-y divide-line border-y border-line">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 py-4">
                    <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-ivory-deep">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized={needsPlainImage(item.image)}
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg leading-tight">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-stone">
                        Qty {item.quantity} · {item.fulfilmentStatus.toLowerCase()}
                      </p>
                    </div>
                    <p className="text-xs">{formatZAR(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[12px] text-stone">
                  Total <span className="font-medium text-ink">{formatZAR(order.total)}</span>
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href={`/order/${order.number}/invoice?key=${encodeURIComponent(key || order.email)}`}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-stone hover:text-oxblood"
                  >
                    <ReceiptText className="size-3.5" aria-hidden />
                    Tax invoice
                  </Link>
                  <Link
                    href={`/order/${order.number}?key=${encodeURIComponent(key || order.email)}`}
                    className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-oxblood hover:underline"
                  >
                    Full order details
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden border border-line bg-cream/60 p-10 lg:block">
              <p className="font-display text-4xl leading-tight text-stone/70">
                Every parcel,
                <br />
                accounted for.
              </p>
              <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-stone">
                Local pieces leave Johannesburg within a day. Global atelier
                pieces are quality-checked and tracked across the journey.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                {["Wrapped", "Dispatched", "Delivered"].map((step, index) => (
                  <div key={step} className="border border-line bg-cream p-3">
                    <p className="font-display text-2xl text-oxblood">{index + 1}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-stone">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
