"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { SplitHeadline } from "@/components/motion/split-headline";
import { SealBadge } from "@/components/motion/seal-badge";
import { formatZAR } from "@/lib/format";
import { imageFor, needsPlainImage } from "@/lib/products";
import type { StoreProduct } from "@/lib/products";

export function Hero({ products }: { products: StoreProduct[] }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const imageY = useTransform(scrollY, [0, 700], [0, -42]);
  const watch =
    products.find((product) => product.category === "Watches") ?? products[0];
  const scent =
    products.find((product) => product.category === "Fragrance") ?? products[1];

  return (
    <section className="grain relative overflow-hidden bg-cream">
      <div className="pointer-events-none absolute -left-40 top-24 size-[34rem] rounded-full bg-blush/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-[26rem] rounded-full bg-champagne/10 blur-3xl" />

      <div className="container-lux relative grid gap-12 pb-16 pt-10 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24 lg:pt-16">
        <div className="relative z-10 lg:col-span-5 lg:py-6">
          <motion.div
            className="flex items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hidden h-px w-9 bg-champagne-dark sm:block" aria-hidden />
            <p className="eyebrow text-[9px] tracking-[0.16em] text-champagne-dark sm:text-[10px] sm:tracking-[0.24em]">
              Where magic gift starts from
            </p>
          </motion.div>

          <h1 className="mt-5 font-display text-[clamp(2.85rem,8.5vw,6.4rem)] leading-[0.93] tracking-[-0.02em] sm:mt-6">
            <span className="block">
              <SplitHeadline text="Gifts they'll" />
            </span>
            <span className="block">
              <SplitHeadline text="actually wear." accentWord="actually" />
            </span>
          </h1>

          <motion.p
            className="mt-7 max-w-md text-[0.95rem] leading-[1.8] text-ink-soft"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            Watches, fragrance, fashion and keepsakes — chosen in Johannesburg,
            wrapped by hand, and sent anywhere in South Africa. Local pieces
            arrive in 2–5 days; global finds come direct from our vetted
            partners.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/collections/gifts" className="btn-primary group">
              Shop the gift edit
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
            <Link href="/gift-finder" className="btn-outline group">
              <Sparkles className="size-3.5" aria-hidden />
              Find their gift
            </Link>
          </motion.div>

          <motion.ul
            className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.14em] text-stone"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.9 }}
          >
            <li>Free delivery over R950</li>
            <li aria-hidden className="text-champagne">◆</li>
            <li>Gift wrap included</li>
            <li aria-hidden className="text-champagne">◆</li>
            <li>PayFast secure checkout</li>
          </motion.ul>
        </div>

        <div className="relative lg:col-span-7">
          <div className="relative mx-auto w-full sm:w-[82%] lg:ml-auto lg:w-[84%]">
            <motion.div
              className="absolute -bottom-3 -left-3 -right-3 top-6 border border-champagne/50 sm:-bottom-5 sm:-left-5 sm:-right-5 sm:top-10"
              initial={reduce ? false : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
            />

            <motion.div
              className="relative aspect-[4/5] overflow-hidden bg-ivory-deep"
              initial={reduce ? false : { opacity: 0, scale: 1.035 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={reduce ? undefined : { y: imageY }}
            >
              <Image
                src="/images/editorial/editorial-fashion.jpg"
                alt="Portrait of a Black woman in a black one-shoulder dress"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover object-[center_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 sm:inset-x-6 sm:bottom-6">
                <p className="max-w-[12rem] font-display text-[1.35rem] leading-tight text-white">
                  The art of giving something they keep.
                </p>
                <span className="text-[9px] uppercase tracking-[0.2em] text-white/70">
                  Vol. 01 / 2026
                </span>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-3 top-8 z-20 hidden sm:right-2 sm:top-10 sm:block"
              initial={reduce ? false : { opacity: 0, y: 24, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <SealBadge />
            </motion.div>

            {watch ? (
              <motion.div
                className="absolute -left-1 bottom-8 z-20 w-[6.4rem] rotate-[-4deg] sm:-left-8 sm:bottom-14 sm:w-[9.5rem]"
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="animate-float rounded-2xl bg-cream p-2 shadow-lift"
                  style={{ animationDelay: "1.2s" }}
                >
                  <FloatingProduct product={watch} label="Most gifted" />
                </div>
              </motion.div>
            ) : null}

            {scent ? (
              <motion.div
                className="absolute -right-1 bottom-[-2rem] z-20 hidden w-[6.8rem] rotate-[3deg] sm:-right-7 sm:bottom-[-2.5rem] sm:block sm:w-[8.5rem]"
                initial={reduce ? false : { opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="animate-float rounded-2xl bg-cream p-2 shadow-lift"
                  style={{ animationDelay: "3s" }}
                >
                  <FloatingProduct product={scent} label="Signature scent" />
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingProduct({
  product,
  label,
}: {
  product: StoreProduct;
  label: string;
}) {
  const src = imageFor(product);
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
        <Image
          src={src}
          alt={product.name}
          fill
          unoptimized={needsPlainImage(src)}
          sizes="180px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="px-0.5 pb-0.5 pt-2">
        <p className="text-[7.5px] font-medium uppercase tracking-[0.18em] text-champagne-dark">
          {label}
        </p>
        <p className="mt-0.5 truncate font-display text-[0.98rem] leading-tight">
          {product.name}
        </p>
        <p className="mt-0.5 text-[10px] text-stone">{formatZAR(product.price)}</p>
      </div>
    </Link>
  );
}
