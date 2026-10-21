"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const STEPS = ["Bag", "Details", "Payment", "Confirm"];

export function CheckoutProgress({ confirmed }: { confirmed: boolean }) {
  const reduce = useReducedMotion();
  const activeIndex = confirmed ? 3 : 1;

  return (
    <ol className="grid grid-cols-4 gap-2 border border-line bg-cream p-4" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const done = index < activeIndex || (confirmed && index <= activeIndex);
        const active = index === activeIndex;
        return (
          <li key={step} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                  done || active ? "bg-ink text-ivory" : "border border-line text-stone"
                }`}
              >
                {done && !active ? "✓" : index + 1}
              </span>
              <span
                className={`truncate text-[9px] uppercase tracking-[0.12em] ${
                  active ? "text-ink" : "text-stone"
                }`}
              >
                {step}
              </span>
            </div>
            <div className="mt-2 h-px bg-line">
              <motion.div
                className="h-full origin-left bg-oxblood"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: EASE_SILK }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
