"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { formatZAR } from "@/lib/format";
import { EASE_SILK } from "@/lib/motion";

export function CountUp({
  value,
  currency = false,
  className,
}: {
  value: number;
  currency?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration: 0.9,
      ease: EASE_SILK,
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const shown = reduce ? value : display;
  const formatted = currency
    ? formatZAR(Math.round(shown))
    : Math.round(shown).toLocaleString("en-ZA");

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
