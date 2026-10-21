"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  ReceiptText,
  Sparkles,
  StickyNote,
  Users,
} from "lucide-react";

const VALUE_PROPS = [
  {
    icon: Boxes,
    title: "Consolidated delivery",
    copy: "One dispatch to your office, or split across teams and cities.",
  },
  {
    icon: StickyNote,
    title: "Handwritten gift notes",
    copy: "A personal line written and tucked into every box.",
  },
  {
    icon: ReceiptText,
    title: "VAT invoices",
    copy: "One clean, itemised invoice for finance — not a pile of receipts.",
  },
  {
    icon: Users,
    title: "Per-head budgets",
    copy: "Tell us the headcount and number; we build the edit to match.",
  },
];

export function BulkQuoteCta() {
  const reduce = useReducedMotion();

  return (
    <section className="container-lux pb-16 sm:pb-20 lg:pb-24">
      <div className="surface-card surface-grid-fine relative overflow-hidden px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 w-full text-champagne/45"
          viewBox="0 0 900 190"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M-10 160C120 160 140 74 300 82C448 90 486 164 660 118C756 93 800 48 910 36"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
          />
          <motion.path
            d="M-10 160C120 160 140 74 300 82C448 90 486 164 660 118C756 93 800 48 910 36"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray="4 8"
            animate={reduce ? undefined : { strokeDashoffset: [0, -24] }}
            transition={
              reduce
                ? undefined
                : { duration: 1.9, repeat: Infinity, ease: "linear" }
            }
          />
          <circle cx="300" cy="82" r="3" fill="currentColor" />
          <circle cx="660" cy="118" r="3" fill="currentColor" />
        </svg>

        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-7">
            <span className="grid-badge">
              <Sparkles className="size-3 text-oxblood" aria-hidden />
              Corporate &amp; bulk gifting
            </span>
            <h2 className="mt-5 max-w-xl font-display text-[clamp(2.2rem,4.8vw,3.9rem)] leading-[0.99]">
              Ten gifts. One invoice.{" "}
              <span className="italic text-oxblood">Zero scramble.</span>
            </h2>
            <p className="mt-5 max-w-lg text-[12.5px] leading-relaxed text-stone">
              From a client thank-you list to a full team rollout, we consolidate
              the order, wrap each piece by hand and send it where it needs to
              go. Tell us the headcount, budget and date — we will come back
              with a costed edit.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/contact" className="btn-primary group">
                Request a quote
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link href="/studio" className="btn-outline group">
                Visit the studio
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {VALUE_PROPS.map((prop) => {
                const Icon = prop.icon;
                return (
                  <div
                    key={prop.title}
                    className="rounded-[1.1rem] border border-line bg-cream/85 p-4 backdrop-blur-sm"
                  >
                    <Icon
                      className="size-4 text-oxblood"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <p className="mt-3 text-[8.5px] font-medium uppercase tracking-[0.14em] text-ink">
                      {prop.title}
                    </p>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-stone">
                      {prop.copy}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[8.5px] uppercase tracking-[0.15em] text-stone">
              No form on this page · a real person replies
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
