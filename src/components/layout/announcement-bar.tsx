"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Sparkles } from "lucide-react";

const messages = [
  { short: "Free gift wrap on every order", full: "Complimentary gift wrap on every order" },
  { short: "Free delivery over R950", full: "Free delivery on orders over R950" },
  { short: "Gifts delivered nationwide", full: "Thoughtful gifts, delivered across South Africa" },
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="relative z-[60] bg-oxblood text-ivory">
      <Link
        href="/collections/gifts"
        className="container-lux flex h-9 items-center justify-center gap-1.5 text-center sm:gap-2.5"
      >
        <Sparkles className="size-3 shrink-0 text-champagne sm:size-3.5" aria-hidden />
        <span className="relative block h-[14px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={index}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="block whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.1em] sm:text-[11px] sm:tracking-[0.18em]"
            >
              <span className="sm:hidden">{messages[index].short}</span>
              <span className="hidden sm:inline">{messages[index].full}</span>
            </motion.span>
          </AnimatePresence>
        </span>
        <Sparkles className="hidden size-3.5 shrink-0 text-champagne sm:block" aria-hidden />
      </Link>
    </div>
  );
}
