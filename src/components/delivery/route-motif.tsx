"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const ROUTE = "M 48 150 C 110 120, 132 64, 210 54 C 270 46, 300 88, 348 46";

function PinGlyph({ fill }: { fill: string }) {
  return (
    <g transform="translate(0 -7)">
      <path
        d="M0 11 C -4.2 5.4 -6.4 2.2 -6.4 -1.4 A6.4 6.4 0 1 1 6.4 -1.4 C 6.4 2.2 4.2 5.4 0 11 Z"
        fill={fill}
      />
      <circle cy={-2.2} r={2} fill="var(--color-cream)" />
    </g>
  );
}

export function RouteMotif() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-6 border border-line bg-cream p-4">
      <svg
        viewBox="0 0 396 190"
        className="h-auto w-full"
        role="img"
        aria-label="A route drawing from Johannesburg across South Africa"
      >
        <path d="M0 152h396M0 96h396M0 40h396" stroke="var(--color-line)" strokeDasharray="2 8" opacity={0.55} />
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--color-oxblood)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {!reduce ? (
          <motion.path
            d={ROUTE}
            fill="none"
            stroke="var(--color-champagne-dark)"
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            whileInView={{ pathLength: 1, opacity: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_SILK }}
          />
        ) : null}
        <g transform="translate(48 150)">
          <circle r={13} fill="var(--color-cream)" stroke="var(--color-oxblood)" strokeWidth={1.4} />
          <PinGlyph fill="var(--color-oxblood)" />
        </g>
        <g transform="translate(348 46)">
          <circle r={13} fill="var(--color-cream)" stroke="var(--color-champagne-dark)" strokeWidth={1.4} />
          <PinGlyph fill="var(--color-champagne-dark)" />
        </g>
      </svg>
      <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-stone">
        Johannesburg atelier · anywhere in South Africa
      </p>
    </div>
  );
}
