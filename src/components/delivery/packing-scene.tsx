"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckSeal, Spark } from "@/components/icons/atelier-icons";
import { DURATION, EASE_SILK } from "@/lib/motion";
import { needsPlainImage } from "@/lib/products";

type PackingItem = { name: string; image: string };

const SEALED = new Set(["PACKED", "SHIPPED", "DELIVERED"]);

export function PackingScene({
  status,
  items,
  className = "",
}: {
  status: string;
  items: PackingItem[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const sealed = SEALED.has(status);
  const delivered = status === "DELIVERED";
  const visibleItems = items.slice(0, 3);

  if (status === "CANCELLED") return null;

  const caption = delivered
    ? "Delivered and signed for."
    : sealed
      ? "Wrapped, sealed and ready for the courier."
      : "Being packed at the atelier.";

  return (
    <section
      className={`border border-line bg-ivory/60 p-5 sm:p-7 ${className}`}
      aria-label="Packing scene"
      data-testid="packing-scene"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow text-champagne-dark">The atelier</p>
          <h3 className="mt-1 font-display text-3xl leading-tight">
            {sealed ? "Tied by hand." : "Packing your gift."}
          </h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-stone">
          {delivered ? "Complete" : sealed ? "Sealed" : "In progress"}
        </p>
      </div>

      <div
        className="relative mx-auto mt-5 h-[290px] w-full max-w-[430px]"
        style={{ perspective: 1100 }}
      >
        <div className="absolute inset-x-10 bottom-5 h-12 rounded-full bg-ink/10 blur-2xl" aria-hidden />

        <motion.div
          key={`${status}-${run}`}
          className="absolute inset-x-[8%] bottom-10 top-4 origin-bottom"
          style={{ transformStyle: "preserve-3d" }}
          initial={reduce ? false : { opacity: 0, y: 30, rotateX: 16 }}
          animate={{ opacity: 1, y: 0, rotateX: 7 }}
          transition={{ duration: DURATION.scene, ease: EASE_SILK }}
        >
          <div
            className="absolute inset-x-0 bottom-0 top-[30%] bg-oxblood shadow-lift"
            style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
            aria-hidden
          />
          <div
            className="absolute inset-x-[7%] bottom-[8%] top-[34%] bg-ivory-deep"
            style={{ clipPath: "polygon(3% 0, 97% 0, 94% 100%, 6% 100%)" }}
            aria-hidden
          />

          <motion.div
            className="absolute inset-x-[11%] top-[36%] z-10 flex items-end justify-center gap-2"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: DURATION.slow, ease: EASE_SILK }}
          >
            {visibleItems.map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                className="relative h-[94px] w-[70px] overflow-hidden border border-line bg-cream shadow-soft"
                initial={
                  reduce ? false : { opacity: 0, y: 22, rotate: index === 1 ? 0 : index === 0 ? -5 : 5 }
                }
                animate={{ opacity: 1, y: 0, rotate: index === 1 ? 0 : index === 0 ? -4 : 4 }}
                transition={{
                  delay: 0.22 + index * 0.1,
                  duration: DURATION.slow,
                  ease: EASE_SILK,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={70}
                  height={94}
                  unoptimized={needsPlainImage(item.image)}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          <div
            className="absolute inset-x-[10%] bottom-[4%] h-6 rounded-[50%] bg-cream/90"
            aria-hidden
          />

          <motion.div
            className="absolute left-1/2 top-[28%] z-20 h-[58%] w-[18px] -translate-x-1/2 bg-champagne"
            initial={sealed && !reduce ? { scaleY: 0, opacity: 0 } : false}
            animate={{ scaleY: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 0.95, duration: DURATION.slow, ease: EASE_SILK }}
            style={{ originY: 0 }}
            aria-hidden
          />
          <motion.div
            className="absolute inset-x-[4%] top-[58%] z-20 h-[18px] bg-champagne"
            initial={sealed && !reduce ? { scaleX: 0, opacity: 0 } : false}
            animate={{ scaleX: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 1.05, duration: DURATION.slow, ease: EASE_SILK }}
            style={{ originX: 0.5 }}
            aria-hidden
          />

          <motion.div
            className="absolute left-1/2 top-[22%] z-30 -translate-x-1/2"
            initial={sealed && !reduce ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 1.3, duration: DURATION.base, ease: EASE_SILK }}
            aria-hidden
          >
            <span className="absolute left-[-18px] top-0 block h-6 w-7 -rotate-[22deg] rounded-full border-[5px] border-champagne bg-transparent" />
            <span className="absolute left-[2px] top-0 block h-6 w-7 rotate-[22deg] rounded-full border-[5px] border-champagne bg-transparent" />
            <span className="relative block size-4 rounded-full bg-champagne shadow-soft" />
          </motion.div>

          <motion.div
            className="absolute bottom-[30%] right-[13%] z-30 flex size-14 items-center justify-center rounded-full border border-champagne-dark/60 bg-cream text-champagne-dark shadow-soft"
            initial={reduce ? false : { scale: 1.5, opacity: 0, rotate: -12 }}
            animate={{ scale: sealed ? 1 : 0, opacity: sealed ? 1 : 0, rotate: -8 }}
            transition={{ delay: 1.45, duration: DURATION.base, ease: EASE_SILK }}
            aria-hidden
          >
            {delivered ? <CheckSeal size={26} /> : <span className="font-display text-lg">LS</span>}
          </motion.div>

          <motion.div
            className="absolute left-[12%] top-[18%] z-30"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: DURATION.slow, ease: EASE_SILK }}
            aria-hidden
          >
            <span className="block h-5 w-16 rotate-[-6deg] border border-line bg-cream shadow-soft" />
          </motion.div>
        </motion.div>

        {sealed ? (
          <>
            {[
              { left: "17%", top: "20%", delay: 1.55 },
              { left: "78%", top: "34%", delay: 1.68 },
              { left: "68%", top: "14%", delay: 1.8 },
            ].map((spark) => (
              <motion.span
                key={spark.left}
                className="absolute z-40 text-champagne-dark"
                style={{ left: spark.left, top: spark.top }}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={reduce ? { opacity: 0 } : { opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
                transition={{
                  delay: spark.delay,
                  duration: 1.1,
                  ease: EASE_SILK,
                  times: [0, 0.35, 1],
                }}
                aria-hidden
              >
                <Spark size={14} />
              </motion.span>
            ))}
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-[11px] leading-relaxed text-stone" aria-live="polite">
          {caption}{" "}
          {visibleItems.length > 0
            ? `${visibleItems.length} piece${visibleItems.length === 1 ? "" : "s"} in this gift.`
            : ""}
        </p>
        {sealed && !reduce ? (
          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className="border border-line bg-cream px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
          >
            Replay packing
          </button>
        ) : null}
      </div>
    </section>
  );
}
