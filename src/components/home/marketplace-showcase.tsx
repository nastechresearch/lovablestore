"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { ArrowRight, ArrowUpRight, Globe2, MapPin } from "lucide-react";
import { formatZAR } from "@/lib/format";

type MarketplaceEdit = {
  title: string;
  note: string;
  href: string;
  image: string;
  alt: string;
  price: number;
  source: "Local stock" | "Global atelier";
  factor: number;
  depth: number;
  offset: string;
};

const EDITS: MarketplaceEdit[] = [
  {
    title: "Watches",
    note: "Quiet everyday classics and modern chronographs.",
    href: "/collections/watches",
    image: "/images/editorial/editorial-watch.jpg",
    alt: "A Black woman's hands wearing a watch and gold rings",
    price: 89900,
    source: "Local stock",
    factor: 1,
    depth: 34,
    offset: "",
  },
  {
    title: "Women",
    note: "Considered pieces for work, weekends and occasion.",
    href: "/collections/women",
    image: "/images/editorial/hero-woman.jpg",
    alt: "Portrait of a stylish Black woman in an elegant dress",
    price: 34900,
    source: "Local stock",
    factor: 0.7,
    depth: 18,
    offset: "md:mt-10",
  },
  {
    title: "Global gifts",
    note: "Vetted atelier finds, imported to order.",
    href: "/collections/global",
    image: "/images/editorial/hero-gifts.jpg",
    alt: "A Black couple exchanging a wrapped gift",
    price: 38900,
    source: "Global atelier",
    factor: 1.2,
    depth: 46,
    offset: "md:mt-4",
  },
];

type SpringValue = ReturnType<typeof useSpring>;

function TiltCard({
  edit,
  index,
  active,
  x,
  y,
}: {
  edit: MarketplaceEdit;
  index: number;
  active: boolean;
  x: SpringValue;
  y: SpringValue;
}) {
  const reduce = useReducedMotion();
  const rotateX = useTransform(y, [-0.5, 0.5], [6 * edit.factor, -6 * edit.factor]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-9 * edit.factor, 9 * edit.factor]);
  const SourceIcon = edit.source === "Local stock" ? MapPin : Globe2;

  return (
    <motion.div
      className={`relative ${edit.offset}`}
      style={
        active
          ? {
              rotateX,
              rotateY,
              z: edit.depth,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      initial={reduce ? false : { opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{
        duration: 0.85,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        href={edit.href}
        aria-label={`${edit.title} — from ${formatZAR(edit.price)}`}
        className="surface-card group block h-full transition-shadow duration-500 hover:shadow-lift"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
          <Image
            src={edit.image}
            alt={edit.alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[8.5px] uppercase tracking-[0.14em] text-white backdrop-blur-sm">
            <SourceIcon className="size-2.5" strokeWidth={1.6} aria-hidden />
            {edit.source}
          </span>
          <span className="absolute bottom-4 left-4 text-[8.5px] uppercase tracking-[0.2em] text-white/70">
            0{index + 1} / The market
          </span>
          <span className="absolute bottom-4 right-4 flex size-8 items-center justify-center rounded-full border border-white/30 text-white transition-colors duration-300 group-hover:border-champagne group-hover:bg-champagne group-hover:text-black">
            <ArrowUpRight className="size-3.5" aria-hidden />
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-[1.7rem] leading-none">
              {edit.title}
            </h3>
            <p className="shrink-0 text-right">
              <span className="block text-[8px] uppercase tracking-[0.16em] text-stone">
                From
              </span>
              <span className="mt-1 block text-[12px] font-medium text-oxblood">
                {formatZAR(edit.price)}
              </span>
            </p>
          </div>
          <p className="mt-2.5 max-w-[19rem] text-[11px] leading-relaxed text-stone">
            {edit.note}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function MarketplaceShowcase() {
  const reduce = useReducedMotion();
  const [canTilt, setCanTilt] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 130, damping: 22, mass: 0.45 });
  const springY = useSpring(y, { stiffness: 130, damping: 22, mass: 0.45 });
  const active = canTilt && !reduce;

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanTilt(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (!active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    x.set(0);
    y.set(0);
  }

  return (
    <section className="relative overflow-hidden border-y border-line bg-cream/60">
      <div
        className="surface-grid-fine pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      />
      <div className="container-lux relative py-16 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow flex items-center gap-3 text-champagne-dark">
              <span className="h-px w-7 bg-champagne-dark" aria-hidden />
              The marketplace
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,5vw,4.1rem)] leading-[0.98]">
              The market, but{" "}
              <span className="italic text-oxblood">considered.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-stone text-pretty">
              Two sources, one shelf. Local stock is held in our Johannesburg
              studio and arrives in 2–5 business days — no customs, no import
              wait. Global atelier pieces come from vetted partners,
              customs-cleared and tracked, in 10–18 business days. Every piece
              says which before you add to cart.
            </p>
          </div>
          <div className="flex flex-col gap-4 lg:col-span-5 lg:items-end">
            <div className="flex flex-wrap gap-2">
              <span className="grid-badge text-ink">
                <MapPin className="size-3 text-oxblood" aria-hidden />
                Local stock
              </span>
              <span className="grid-badge text-ink">
                <Globe2 className="size-3 text-oxblood" aria-hidden />
                Global atelier
              </span>
            </div>
            <p className="hidden text-[9px] uppercase tracking-[0.16em] text-stone lg:block">
              Move your cursor across the table
            </p>
            <Link href="/shop" className="group btn-outline mt-1">
              Browse the full market
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>

        <div
          className="relative mt-12 sm:mt-14"
          onMouseMove={handleMove}
          onMouseLeave={resetTilt}
        >
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[-5rem] h-[26rem] overflow-hidden [perspective:620px]"
            aria-hidden
          >
            <div
              className="absolute inset-x-[-18%] bottom-0 h-[32rem] origin-bottom"
              style={{
                transform: "rotateX(68deg)",
                backgroundImage:
                  "linear-gradient(to right, var(--surface-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--surface-grid-line) 1px, transparent 1px)",
                backgroundSize: "52px 52px",
                maskImage:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 76%)",
                WebkitMaskImage:
                  "linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 76%)",
              }}
            />
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/10 blur-3xl" aria-hidden />

          <div className="relative grid gap-5 [perspective:1400px] md:grid-cols-3 md:gap-4 lg:gap-5">
            {EDITS.map((edit, index) => (
              <TiltCard
                key={edit.href}
                edit={edit}
                index={index}
                active={active}
                x={springX}
                y={springY}
              />
            ))}
          </div>
        </div>

        <div className="relative mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5 text-[9px] uppercase tracking-[0.16em] text-stone sm:mt-16">
          <p>Local: 2–5 days · no customs</p>
          <p>Global: 10–18 days · customs cleared · tracked</p>
        </div>
      </div>
    </section>
  );
}
