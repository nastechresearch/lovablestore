"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole, Minus, Plus, ShieldCheck, Truck, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { formatZAR, shippingForSubtotal } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { needsPlainImage } from "@/lib/products";

export function CartView() {
  const {
    items,
    hydrated,
    subtotal,
    count,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!hydrated) {
    return (
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          {[0, 1].map((key) => (
            <div key={key} className="h-32 animate-pulse bg-ivory-deep/70" />
          ))}
        </div>
        <div className="h-72 animate-pulse bg-ivory-deep/70" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-line bg-cream px-6 py-16 text-center">
        <p className="eyebrow text-champagne-dark">Your selection</p>
        <h2 className="mt-4 font-display text-4xl sm:text-5xl">Your bag is empty.</h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone">
          Start with a signature watch, a scent they&apos;ll remember, or a gift
          box that arrives ready to give.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Explore the store
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/gift-finder" className="btn-outline">
            Take the gift finder
          </Link>
        </div>
      </div>
    );
  }

  const shipping = shippingForSubtotal(subtotal);
  const total = subtotal + shipping;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="grid gap-10 pb-24 lg:grid-cols-[1.45fr_0.55fr] lg:gap-14 lg:pb-0">
      <div>
        <div className="border-y border-line">
          <div className="flex items-center justify-between py-3 text-[10px] uppercase tracking-[0.16em] text-stone">
            <span>{count} {count === 1 ? "item" : "items"}</span>
            <button
              type="button"
              onClick={clearCart}
              className="transition-colors hover:text-oxblood"
            >
              Clear bag
            </button>
          </div>
        </div>

        <ul className="divide-y divide-line border-b border-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-4 py-6 sm:gap-6">
              <Link
                href={`/product/${item.slug}`}
                className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-ivory-deep sm:w-32"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  unoptimized={needsPlainImage(item.image)}
                  sizes="(max-width: 640px) 96px, 128px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/product/${item.slug}`}
                      className="font-display text-xl leading-tight hover:text-oxblood sm:text-2xl"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone">
                      {item.size ? `Size ${item.size} · ` : ""}In stock
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="flex size-11 shrink-0 items-center justify-center text-stone transition-colors hover:text-oxblood"
                    aria-label={`Remove ${item.name}`}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>

                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="flex size-11 items-center justify-center transition-colors hover:bg-ivory-deep"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus className="size-3.5" aria-hidden />
                    </button>
                    <span className="w-8 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="flex size-11 items-center justify-center transition-colors hover:bg-ivory-deep disabled:opacity-30"
                      aria-label={`Increase quantity of ${item.name}`}
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="size-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatZAR(item.price * item.quantity)}
                    </p>
                    {item.quantity > 1 ? (
                      <p className="text-[10px] text-stone">
                        {formatZAR(item.price)} each
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <p className="text-xs text-stone">
            {remaining > 0
              ? `Add ${formatZAR(remaining)} more for complimentary delivery.`
              : "Complimentary delivery unlocked."}
          </p>
          <div className="mt-3 h-[3px] overflow-hidden bg-ivory-deep">
            <div
              className="h-full bg-oxblood transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 grid gap-3 border border-line bg-cream p-5 sm:grid-cols-3">
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone">
            <Truck className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
            Nationwide delivery in 2–5 days
          </p>
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
            30-day returns on eligible pieces
          </p>
          <p className="flex items-start gap-2 text-[11px] leading-relaxed text-stone">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
            Secure PayFast checkout
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-line bg-cream p-6">
          <h2 className="font-display text-3xl">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-stone">Subtotal</dt>
              <dd>{formatZAR(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-stone">Delivery</dt>
              <dd>{shipping === 0 ? "Complimentary" : formatZAR(shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
              <dt className="text-[11px] uppercase tracking-[0.14em]">Estimated total</dt>
              <dd className="font-display text-2xl">{formatZAR(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[10px] text-stone">
            Incl. 15% VAT. Delivery is free from R950, otherwise R85 nationwide.
          </p>
          <p className="mt-1 text-[10px] text-stone">
            Promo codes are applied securely at checkout.
          </p>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout securely
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/shop" className="btn-quiet mt-4 w-full">
            Continue shopping
          </Link>
          <p className="mt-5 text-center text-[10px] uppercase tracking-[0.14em] text-stone">
            Free gift wrap included
          </p>
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-[calc(4.85rem+env(safe-area-inset-bottom))] z-[60] border-t border-line bg-cream/95 px-4 py-3 shadow-lift backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.16em] text-stone">
              Estimated total
            </p>
            <p className="font-display text-xl leading-tight">{formatZAR(total)}</p>
          </div>
          <Link href="/checkout" className="btn-primary shrink-0 px-5 text-[10px]">
            Checkout
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
