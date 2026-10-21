"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Heart,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { formatZAR } from "@/lib/format";
import { deliveryLabel } from "@/lib/products";
import type { StoreProduct } from "@/lib/products";
import { PromoCodeChip } from "@/components/promo/promo-code-chip";
import { DeliveryJourney } from "@/components/delivery/delivery-journey";
import { flyToBag } from "@/components/motion/fly-to-bag";
import type { DeliveryPlan } from "@/lib/delivery";

type PromoHint = { code: string; label: string; description: string | null };

export function ProductPurchase({
  product,
  primaryImage,
  promos,
  deliveryPlan,
}: {
  product: StoreProduct;
  primaryImage: string;
  promos: PromoHint[];
  deliveryPlan: DeliveryPlan;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [size, setSize] = useState<string | undefined>(
    product.sizes.length === 1 ? product.sizes[0] : undefined,
  );
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const sizes = product.sizes;
  const soldOut = product.stock <= 0;
  const lowStock = !soldOut && product.stock <= 6;
  const maxQuantity = Math.max(1, Math.min(product.stock, 10));

  useEffect(() => {
    const node = panelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(timer);
  }, [added]);

  function resolveSize(): string | undefined | null {
    if (sizes.length === 0) return undefined;
    if (!size) {
      setError("Please choose a size first.");
      return null;
    }
    return size;
  }

  function handleAdd(openDrawer = true, origin?: HTMLElement) {
    if (soldOut) return;
    const chosen = resolveSize();
    if (chosen === null) return;
    setError(null);
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: primaryImage,
        size: chosen,
        stock: product.stock,
      },
      quantity,
    );
    if (origin) {
      const rect = origin.getBoundingClientRect();
      flyToBag({
        image: primaryImage,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    if (!openDrawer) {
      router.push("/checkout");
      return;
    }
    setAdded(true);
  }

  return (
    <>
      <div ref={panelRef} className="lg:pl-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-stone">
          {product.category} · {product.recipient}
        </p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="font-display text-[clamp(2.25rem,4.5vw,3.4rem)] leading-[1.02]">
            {product.name}
          </h1>
          <WishlistButton
            productId={product.id}
            productName={product.name}
            className="mt-1 shrink-0 border border-line hover:border-oxblood"
          />
        </div>
        {product.tagline ? (
          <p className="mt-3 max-w-md font-display text-xl italic leading-snug text-ink-soft">
            {product.tagline}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xl font-medium">{formatZAR(product.price)}</span>
          {product.compareAtPrice ? (
            <>
              <span className="text-sm text-stone line-through">
                {formatZAR(product.compareAtPrice)}
              </span>
              <span className="bg-oxblood/10 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-oxblood">
                Save {formatZAR(product.compareAtPrice - product.price)}
              </span>
            </>
          ) : null}
        </div>
        <p className="mt-1.5 text-[11px] text-stone">
          Incl. 15% VAT · Or 4 interest-free payments of{" "}
          {formatZAR(Math.round(product.price / 4))} ·{" "}
          <Link href="/delivery-and-returns" className="underline decoration-line underline-offset-2 hover:text-oxblood">
            delivery &amp; returns
          </Link>
        </p>

        {product.promoLabel ? (
          <p className="mt-4 inline-flex items-center gap-2 border border-champagne/60 bg-champagne/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-champagne-dark">
            <span className="size-1.5 rounded-full bg-champagne-dark" aria-hidden />
            {product.promoLabel}
          </p>
        ) : null}

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-stone">
          {product.description}
        </p>

        {sizes.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <p className="label mb-0">Select size</p>
              <span className="text-[10px] uppercase tracking-[0.12em] text-stone">
                {size ?? "Choose one"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSize(option);
                    setError(null);
                  }}
                  className={`min-h-11 min-w-12 border px-4 text-[11px] uppercase tracking-[0.1em] transition-all duration-200 ${
                    size === option
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-transparent text-ink hover:border-ink"
                  }`}
                  aria-pressed={size === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="flex h-12 w-fit items-center border border-line">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="flex h-full w-11 items-center justify-center transition-colors hover:bg-ivory-deep disabled:opacity-30"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}
            >
              <Minus className="size-3.5" aria-hidden />
            </button>
            <span className="w-9 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
              className="flex h-full w-11 items-center justify-center transition-colors hover:bg-ivory-deep disabled:opacity-30"
              aria-label="Increase quantity"
              disabled={quantity >= maxQuantity}
            >
              <Plus className="size-3.5" aria-hidden />
            </button>
          </div>

          <button
            type="button"
            onClick={(event) => handleAdd(true, event.currentTarget)}
            disabled={soldOut}
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {soldOut ? (
              "Sold out"
            ) : added ? (
              <>
                <Check className="size-4" aria-hidden />
                Added to bag
              </>
            ) : (
              <>
                <ShoppingBag className="size-4" aria-hidden />
                Add to bag — {formatZAR(product.price * quantity)}
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={(event) => handleAdd(false, event.currentTarget)}
          disabled={soldOut}
          className="btn-outline mt-3 w-full disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy now
          <ArrowRight className="size-4" aria-hidden />
        </button>

        {error ? (
          <p role="alert" className="mt-3 text-xs text-oxblood">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.12em] text-stone">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="size-3.5 text-champagne-dark" aria-hidden />
            {product.shipsFrom} · {deliveryLabel(product)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Heart className="size-3.5 text-champagne-dark" aria-hidden />
            Free gift wrap
          </span>
          {lowStock ? (
            <span className="text-oxblood">Only {product.stock} left</span>
          ) : null}
        </div>

        <div className="mt-4">
          <DeliveryJourney plan={deliveryPlan} compact title="Estimated arrival" />
        </div>

        {promos.length > 0 ? (
          <div className="mt-6 border border-line bg-cream p-4">
            <p className="eyebrow text-stone">Offers on this piece</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {promos.map((promo) => (
                <PromoCodeChip key={promo.code} code={promo.code} />
              ))}
            </div>
          </div>
        ) : null}

        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 text-[11px]">
          <div>
            <dt className="uppercase tracking-[0.12em] text-stone">SKU</dt>
            <dd className="mt-1 font-medium tracking-wide">{product.sku}</dd>
          </div>
          {product.barcode ? (
            <div>
              <dt className="uppercase tracking-[0.12em] text-stone">Barcode</dt>
              <dd className="mt-1 font-medium tracking-wide">{product.barcode}</dd>
            </div>
          ) : null}
          <div>
            <dt className="uppercase tracking-[0.12em] text-stone">Ships from</dt>
            <dd className="mt-1 font-medium">{product.shipsFrom}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.12em] text-stone">Delivery</dt>
            <dd className="mt-1 font-medium">{deliveryLabel(product)}</dd>
          </div>
        </dl>
      </div>

      {showSticky ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lift backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg leading-tight">{product.name}</p>
              <p className="text-xs text-stone">
                {formatZAR(product.price)}
                {product.compareAtPrice ? (
                  <span className="ml-2 line-through">
                    {formatZAR(product.compareAtPrice)}
                  </span>
                ) : null}
              </p>
            </div>
            {sizes.length > 0 && !size ? (
              <button
                type="button"
                onClick={() =>
                  panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
                }
                className="btn-primary shrink-0 px-5 text-[10px]"
              >
                Choose size
              </button>
            ) : (
              <button
                type="button"
                onClick={(event) => handleAdd(true, event.currentTarget)}
                disabled={soldOut}
                className="btn-primary shrink-0 px-5 text-[10px] disabled:opacity-40"
              >
                {soldOut ? "Sold out" : "Add to bag"}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
