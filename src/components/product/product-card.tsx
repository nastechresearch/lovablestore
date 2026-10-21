"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Star } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { WishlistButton } from "@/components/wishlist/wishlist-button";
import { formatZAR } from "@/lib/format";
import {
  deliveryLabel,
  imageFor,
  isLocalProduct,
  needsPlainImage,
} from "@/lib/products";
import type { StoreProduct } from "@/lib/products";

export function ProductCard({
  product,
  priority = false,
}: {
  product: StoreProduct;
  priority?: boolean;
}) {
  const { addItem } = useCart();
  const primary = imageFor(product);
  const secondary = product.images[1];
  const hasSizes = product.sizes.length > 0;
  const local = isLocalProduct(product);

  function quickAdd() {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: primary,
      stock: product.stock,
    });
  }

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-deep">
        <Link href={`/product/${product.slug}`} className="absolute inset-0 z-10" aria-label={`View ${product.name}`}>
          <Image
            src={primary}
            alt={product.name}
            fill
            priority={priority}
            unoptimized={needsPlainImage(primary)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045]"
          />
          {secondary ? (
            <Image
              src={secondary}
              alt=""
              fill
              unoptimized={needsPlainImage(secondary)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              aria-hidden
            />
          ) : null}
        </Link>

        {product.badge ? (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-cream/95 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.16em] text-oxblood backdrop-blur-sm">
            {product.badge}
          </span>
        ) : null}

        <WishlistButton
          productId={product.id}
          productName={product.name}
          className="absolute right-3 top-3 z-20 translate-y-0 opacity-100 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100"
        />

        {hasSizes ? (
          <Link
            href={`/product/${product.slug}`}
            className="absolute bottom-3 right-3 z-20 flex size-11 translate-y-0 items-center justify-center rounded-full bg-cream/95 text-ink opacity-100 shadow-soft backdrop-blur-sm transition-all duration-300 hover:bg-oxblood hover:text-ivory md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100"
            aria-label={`Choose options for ${product.name}`}
          >
            <Plus className="size-4" aria-hidden />
          </Link>
        ) : (
          <button
            type="button"
            onClick={quickAdd}
            className="absolute bottom-3 right-3 z-20 flex size-11 translate-y-0 items-center justify-center rounded-full bg-cream/95 text-ink opacity-100 shadow-soft backdrop-blur-sm transition-all duration-300 hover:bg-oxblood hover:text-ivory md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus:translate-y-0 md:focus:opacity-100"
            aria-label={`Add ${product.name} to bag`}
          >
            <Plus className="size-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="text-[9.5px] font-medium uppercase tracking-[0.16em] text-stone">
          {product.recipient} · {product.category}
        </p>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.35rem] leading-[1.1]">
            <Link
              href={`/product/${product.slug}`}
              className="transition-colors hover:text-oxblood"
            >
              {product.name}
            </Link>
          </h3>
          <ArrowUpRight
            className="mt-1 size-4 shrink-0 text-stone opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{formatZAR(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-xs text-stone line-through">
              {formatZAR(product.compareAtPrice)}
            </span>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-stone">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 fill-champagne text-champagne" aria-hidden />
            {product.rating.toFixed(1)}
            <span className="text-stone/60">({product.reviewCount})</span>
          </span>
          <span className="size-0.5 rounded-full bg-stone/40" aria-hidden />
          <span>{local ? "Local" : "Global"} · {deliveryLabel(product)}</span>
        </div>
      </div>
    </article>
  );
}
