"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { needsPlainImage } from "@/lib/products";

export function ProductGallery({
  images,
  name,
  badge,
}: {
  images: string[];
  name: string;
  badge: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const touchX = useRef<number | null>(null);
  const safeImages = images.length > 0 ? images : [];
  const current = safeImages[index] ?? "";

  function go(next: number) {
    if (safeImages.length < 2) return;
    setDirection(next > index ? 1 : -1);
    setIndex((next + safeImages.length) % safeImages.length);
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div
        className="group relative aspect-[4/5] overflow-hidden bg-ivory-deep"
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchX.current;
          touchX.current = null;
          if (start == null) return;
          const delta = (event.changedTouches[0]?.clientX ?? start) - start;
          if (Math.abs(delta) < 45) return;
          go(delta < 0 ? index + 1 : index - 1);
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={`${current}-${index}`}
            custom={direction}
            initial={{ opacity: 0, x: direction * 36, scale: 1.015 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -24, scale: 0.995 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current}
              alt={`${name} — view ${index + 1}`}
              fill
              priority={index === 0}
              unoptimized={needsPlainImage(current)}
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {badge ? (
          <span className="pointer-events-none absolute left-4 top-4 z-10 bg-cream/95 px-3 py-1.5 text-[9.5px] font-medium uppercase tracking-[0.16em] text-oxblood shadow-soft backdrop-blur-sm">
            {badge}
          </span>
        ) : null}

        {safeImages.length > 1 ? (
          <>
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between p-4">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="flex size-11 items-center justify-center bg-cream/90 text-ink shadow-soft backdrop-blur-sm transition-colors hover:bg-oxblood hover:text-ivory"
                aria-label="Previous image"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="bg-cream/85 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft backdrop-blur-sm">
                {index + 1} / {safeImages.length}
              </span>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="flex size-11 items-center justify-center bg-cream/90 text-ink shadow-soft backdrop-blur-sm transition-colors hover:bg-oxblood hover:text-ivory"
                aria-label="Next image"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute right-4 top-4 z-10 flex size-11 items-center justify-center bg-cream/85 text-ink opacity-100 shadow-soft backdrop-blur-sm transition-all duration-300 hover:bg-oxblood hover:text-ivory md:opacity-0 md:group-hover:opacity-100"
          aria-label="View image larger"
        >
          <Expand className="size-4" aria-hidden />
        </button>
      </div>

      {safeImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-5 gap-2.5">
          {safeImages.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`relative aspect-[4/5] overflow-hidden border transition-all duration-300 ${
                i === index
                  ? "border-oxblood opacity-100"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
              aria-label={`Show image ${i + 1} of ${name}`}
              aria-current={i === index}
            >
              <Image
                src={src}
                alt=""
                fill
                unoptimized={needsPlainImage(src)}
                sizes="20vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {expanded ? (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${name} enlarged image`}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              className="relative h-full max-h-[88vh] w-full max-w-3xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <Image
                src={current}
                alt={name}
                fill
                unoptimized={needsPlainImage(current)}
                sizes="90vw"
                className="object-contain"
              />
            </motion.div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="absolute right-4 top-4 flex size-11 items-center justify-center bg-cream text-ink transition-colors hover:bg-oxblood hover:text-ivory sm:right-8 sm:top-8"
              aria-label="Close enlarged image"
            >
              ×
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
