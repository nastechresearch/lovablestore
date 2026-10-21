"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Footprints,
  Gem,
  Gift,
  Globe2,
  MapPin,
  Shirt,
  Sparkles,
  SprayCan,
  Watch,
} from "lucide-react";

const CATEGORIES = [
  {
    label: "Watches",
    description: "Quiet classics, held locally.",
    href: "/collections/watches",
    icon: Watch,
  },
  {
    label: "Fragrance",
    description: "Signature scents, blended close.",
    href: "/collections/fragrance",
    icon: SprayCan,
  },
  {
    label: "Women",
    description: "Considered pieces, everyday.",
    href: "/collections/women",
    icon: Gem,
  },
  {
    label: "Men",
    description: "Linen, merino and leather.",
    href: "/collections/men",
    icon: Shirt,
  },
  {
    label: "Shoes",
    description: "Built for the long day.",
    href: "/collections/shoes",
    icon: Footprints,
  },
  {
    label: "Gifts",
    description: "Wrapped by hand, ready.",
    href: "/collections/gifts",
    icon: Gift,
  },
  {
    label: "Local finds",
    description: "From the Johannesburg studio.",
    href: "/collections/local",
    icon: MapPin,
  },
  {
    label: "Global finds",
    description: "Vetted ateliers, customs cleared.",
    href: "/collections/global",
    icon: Globe2,
  },
];

export function CategoryRail() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Shop by category"
      className="border-y border-line bg-cream/70"
    >
      <div className="container-lux py-6 sm:py-7">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <motion.span
              className="flex text-champagne-dark"
              animate={
                reduce
                  ? undefined
                  : { rotate: [0, 16, 0], scale: [1, 1.16, 1], opacity: [0.7, 1, 0.7] }
              }
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              <Sparkles className="size-3.5" strokeWidth={1.6} />
            </motion.span>
            <p className="eyebrow text-champagne-dark">Shop the house</p>
            <span className="hidden h-px w-8 bg-line sm:block" aria-hidden />
            <p className="hidden text-[9px] uppercase tracking-[0.16em] text-stone sm:block">
              Eight edits, one standard
            </p>
          </div>
          <Link
            href="/shop"
            className="group hidden shrink-0 items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-oxblood sm:flex"
          >
            All categories
            <ArrowRight
              className="size-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <div className="no-scrollbar -mx-5 mt-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-5 pb-1 sm:-mx-2 sm:px-2 lg:mt-5 lg:gap-3">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.href}
                href={category.href}
                className="group flex min-w-[13.25rem] snap-start items-start gap-3 rounded-[var(--radius-card)] border border-line bg-cream p-3.5 transition-[transform,border-color,background-color] duration-300 hover:-translate-y-0.5 hover:border-champagne/60 hover:bg-ivory sm:min-w-[14.5rem] sm:p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-ivory-deep/50 text-oxblood transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
                  <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-[1.15rem] leading-none">
                      {category.label}
                    </span>
                    <span className="text-[8px] uppercase tracking-[0.14em] text-stone/55">
                      0{index + 1}
                    </span>
                  </span>
                  <span className="mt-2 block text-[9.5px] leading-relaxed text-stone">
                    {category.description}
                  </span>
                </span>
                <ArrowRight
                  className="mt-1 size-3 shrink-0 self-start text-stone/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-oxblood"
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
